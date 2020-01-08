#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <pthread.h>
#include <ctype.h>
#include <stdbool.h>

#include "game.h"

struct gameargs {//Structure of game data
	char word[30]; 
	int gameport;
	char gameip[30];
};

struct client_info {//Structure of player data
	int sockno;
	char ip[INET_ADDRSTRLEN];
	int gameport;
	char gameip[30];
};

int n3[3000];//Number of players in game 
int clients4[3000][100];//Sockets' numbers of players in game 
char word[3000][30];//Word to guess of every game

pthread_mutex_t mutex2 = PTHREAD_MUTEX_INITIALIZER;

//Thread for game to receive and sent messages with player
void *recvmg2(void *sock)
{
	struct client_info cl = *((struct client_info *)sock);
	char msg[500];
	int len;
	int i;
	int j;
	int portno = cl.gameport;
	//Main loop to receive messages from player
	while((len = recv(cl.sockno,msg,500,0)) > 0) {
		//First char of message is a message type
		//check type of message:
		//'k' - end of game, close host socket, close host thread
		//'p' - the same like 'k' but for player
		//other - message to sent to other players 

		char msgtype = msg[0];
		if(msgtype == 'k'){//Kill host 
			for (int k = 0; k < n3[portno]; ++k)
			{
				pthread_mutex_lock(&mutex2);
				if(cl.sockno == clients4[portno][k]){
					close(clients4[portno][k]);
				}
				pthread_mutex_unlock(&mutex2);
			}

			pthread_mutex_lock(&mutex2);
			printf("%s disconnected\n",cl.ip);
			//Update list of players in game
			for(i = 0; i < n3[portno]; i++) {
				if(clients4[portno][i] == cl.sockno) {
					j = i;
					while(j < n3[portno]-1) {
						clients4[portno][j] = clients4[portno][j+1];
						j++;
					}
				}
			}
			n3[portno]--;
			printf("player %d killed\n",cl.sockno);
			pthread_mutex_unlock(&mutex2);
			pthread_exit(NULL);

		}else if(msgtype=='p'){ //Kill player
			for (int k = 0; k < n3[portno]; ++k)
			{	
				pthread_mutex_lock(&mutex2);
				if(cl.sockno == clients4[portno][k]){
					close(clients4[portno][k]);
				}
				pthread_mutex_unlock(&mutex2);

			}
		}else{
			msg[len] = '\0';

			// START - sendtoall
			//Messages for more players got code
			//First char of message:
			//':' - message to all players (for group chat)
			//'w' - server message that someone won game
			//'9' - host message to players to call out 'kill' by theirself
			pthread_mutex_lock(&mutex2);
			int ii;
			char newmsg[500];

			if(msg[0]==':'){
				//Check that message is word to guess and someone won game

				if(strcmp(msg,word[portno])==0){
					strcpy(newmsg,"win");
					char curruser[10];
					strcpy(curruser,"");
					sprintf(curruser,"%d",cl.sockno);
					strcat(newmsg,curruser);
					strcat(newmsg,":\n");
				}else{
					//if noone won, add who send message to message
					char user[10];
					char curruser[10];
					strcpy(curruser,"");
					sprintf(curruser,"%d",cl.sockno);
					strcpy(user,"$");
					strcat(user,curruser);
					strcat(user,":");
					strcpy(newmsg,user);
					strcat(newmsg,msg);
				}
			}else{//message not for group chat
				strcpy(newmsg,msg);
			}
			//Sending message to all players
			for(ii = 0; ii < n3[portno]; ii++) {
				if(clients4[portno][ii] != cl.sockno) { 
					printf("client - %d\n",clients4[portno][ii] );
					if(send(clients4[portno][ii],newmsg,strlen(newmsg),0) < 0) {
						perror("sending failure");
						continue;
					}
				}else{
					//Some messages are send also to sender of message
					if((newmsg[0]=='$') || (newmsg[0]=='w') || (newmsg[0]=='9')){
						printf("client - %d\n",clients4[portno][ii] );
						if(send(clients4[portno][ii],newmsg,strlen(newmsg),0) < 0) {
							perror("sending failure");
							continue;
						}
					}
				}

			}
			pthread_mutex_unlock(&mutex2);

			// END - sendtoall

			memset(msg,'\0',sizeof(msg));
		}
		
	}

	pthread_mutex_lock(&mutex2);
	printf("%s disconnected from %d\n",cl.ip,cl.sockno);
	//Update list of players in game
	for(i = 0; i < n3[portno]; i++) {
		if(clients4[portno][i] == cl.sockno) {
			j = i;
			while(j < n3[portno]-1) {
				clients4[portno][j] = clients4[portno][j+1];
				j++;
			}
		}
	}
	n3[portno]--;
	printf("player %d killed\n",cl.sockno);
	pthread_mutex_unlock(&mutex2);

	pthread_exit(NULL);
}

//Thread function of new game created by main server
//It is like game server
void *gamemain(void *inputargs)
{
	struct gameargs args = *((struct gameargs*)inputargs);
	struct sockaddr_in my_addr,their_addr;
	int my_sock;
	int their_sock;
	socklen_t their_addr_size;
	int portno;
	pthread_t recvt;
	struct client_info cl;
	char ip[INET_ADDRSTRLEN];
	
	portno = args.gameport;
	n3[portno] = 0;
	strcpy(word[portno],":");
	strcat(word[portno],args.word);
	strcat(word[portno],"\n");
	
	my_sock = socket(AF_INET,SOCK_STREAM,0);
	memset(my_addr.sin_zero,'\0',sizeof(my_addr.sin_zero));
	my_addr.sin_family = AF_INET;
	my_addr.sin_port = htons(portno);
	my_addr.sin_addr.s_addr = inet_addr("127.0.0.1");
	their_addr_size = sizeof(their_addr);

	if(bind(my_sock,(struct sockaddr *)&my_addr,sizeof(my_addr)) != 0) {
		perror("game binding unsuccessful");
		close(my_sock);
		exit(1);
	}

	if(listen(my_sock,50) != 0) {
		perror("game listening unsuccessful");
		exit(1);
	}

	int gameover = 1;
	//Main loop of game server
	while(gameover) {
		if((their_sock = accept(my_sock,(struct sockaddr *)&their_addr,&their_addr_size)) < 0) {
			perror("game accept unsuccessful");
			exit(1);
		}

		pthread_mutex_lock(&mutex2);

		inet_ntop(AF_INET, (struct sockaddr *)&their_addr, ip, INET_ADDRSTRLEN);
		printf("%s connected to %d\n",ip,portno);
		cl.sockno = their_sock;
		strcpy(cl.ip,ip);
		cl.gameport = portno;
		clients4[portno][n3[portno]] = their_sock;
		//Creating new user name:
		char u[20];
		char usockno[10];
		strcpy(u,"u");
		sprintf(usockno,"%d",clients4[portno][n3[portno]]);
		strcat(u,usockno);
		strcat(u,":\n");
		//Send to new user his name in group chat
		send(clients4[portno][n3[portno]],u,sizeof(u),0);
		n3[portno]++;

		//Create thread to connect between game and player
		pthread_create(&recvt,NULL,recvmg2,&cl);

		pthread_mutex_unlock(&mutex2);

	}
	pthread_exit(NULL);
} 