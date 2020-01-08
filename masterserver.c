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

struct gameargs{//Structure of game data
	char word[30]; 
	int gameport;
	char gameip[30];
};

struct client_info{//Structure of player data
	int sockno;
	char ip[INET_ADDRSTRLEN];
	int gameport;
	char gameip[30];
};

pthread_t newgames[1000];//Array of pthreads of all games

#define MAX_OF_GAMES 1000
struct gameargs avalible_games[MAX_OF_GAMES];//Array of games' data
int g = 0;//Iterator of avalible_games[]

int masterserverPORT = 1000; //Main server port
int firstPORT = 1001; //First port for games

int clients[100];//Sockets' numbers of players in game menu
int n = 0;//Number of players in game menu

pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;

//Thread function, it controls games: creates new games, connects client with game,
//shows list of avalible games, ends game.
//This is not the main server main thread. It is menu thread.
void *recvmg(void *sock)
{
	struct client_info cl = *((struct client_info *)sock);
	char msg[500];
	memset(msg,'\0', sizeof(msg));
	int i;
	int j;
	char word[30];
	char answer[20];
	char port[8];
	
	while((recv(cl.sockno,msg,500,0)) > 0) {
		//First char of message is a message type
		//check type of message:
		//'1' - word to guess in new game created by client
		//		If '1' client is the game HOST
		//'2' - port number of game to which client wants to join the game
		//		If '2' client is the game player
		//'3' - send list of avalible games
		//'4' - clean game data, delete pthreads, end game
		char list[200];
		char temp[10];

		pthread_mutex_lock(&mutex);
		switch(msg[0]){
			case '1':
				//Creating new game
				//Add new port
				if(firstPORT<3000){
					avalible_games[g].gameport = firstPORT;
					firstPORT++;
				}else{
					firstPORT = 1001;
					avalible_games[g].gameport = firstPORT;
				}
				//Save word to guess for new game
				for(int k = 0; msg[k+1] != '\0'; k++){
					if(k<30){
						word[k] = msg[k+1];
					}else{
						break;
					}
				}
				strcpy(avalible_games[g].word,word);

				//Check if new game's port is correct
				if(avalible_games[g].gameport > 1000 && avalible_games[g].gameport<3000){
					strcpy(answer,"created");
					sprintf(port,"%d",avalible_games[g].gameport);
					strcat(answer,port);
					strcat(answer,"\n");
					pthread_t tempth;
					//Create new thread for new game
					//Args are game port and word to guess
					pthread_create(&tempth,NULL,gamemain,&avalible_games[g]);
					newgames[g] = tempth;
				}else{
					//If port isn't correct created message about it
					strcpy(answer,"notcrtd\n");
				}
				//Send message about created, or not, new game
				send(cl.sockno,answer,strlen(answer),0);
				if(g >= 999){
					g = 0;
				}else{
					g++;
				}
			break;
			case '2':
				//Player want to connect to existing game
				//Player send message with port of game to connect
				memset(port,0,sizeof(port));
				for(int k = 0; msg[k+1] != '\0'; k++){
					if(k<4){
						port[k] = msg[k+1];
					}else{
						break;
					}
				}
				int connecttoport = atoi(port);
				bool game_exist = false;

				//Check if port is to existing game
				for(int h = 0; h < 1000; h++){
					if(avalible_games[h].gameport == connecttoport){
						game_exist = true;
						break;
					}
				}
				//Check second time if port is really false to be sure
				if(game_exist == false){
					for(int h = 0; h < 1000; h++){
						if(avalible_games[h].gameport == connecttoport){
							game_exist = true;
							break;
						}
					}
				}

				memset(answer,'\0',sizeof(answer));
				if(game_exist == true){
					strcpy(answer,"added\n"); 
				}else{
					strcpy(answer,"notad\n");
				}
				//Send message that player is able to connect or not
				send(cl.sockno,answer,strlen(answer),0);

			break;
			case '3':
				//List of avalible games for player
				strcpy(list,"games");

				//Create list of avalible games
				for (int ii = 0; ii < g; ++ii)
				 {
				 	if(avalible_games[ii].gameport != 999 && avalible_games[ii].gameport != 1000){
				 		strcat(list,"\n");
				 		sprintf(temp,"%d",avalible_games[ii].gameport);
				 		strcat(list,temp);
				 	}
				 } 
				//Send list to player
				send(cl.sockno,list,strlen(list),0);
				memset(list,0,sizeof(list));
			break;
			case '4':
				//Host message that game on port X ended
				memset(port,0,sizeof(port));
				for(int k = 0; msg[k+1] != '\0'; k++){
					if(k<4){
						port[k] = msg[k+1];
					}else{
						break;
					}
				}
				int endgameport = atoi(port);
				int endgamenumber;
				//Looking for number of game in local array
				for(int h = 0; h < 1000; h++){
					if(avalible_games[h].gameport == endgameport){
						endgamenumber = h;
						break;
					}
				}
				printf("Game no. %d ended.\n",avalible_games[endgamenumber].gameport);
				//Port 999 mean that game is unavalible
				avalible_games[endgamenumber].gameport = 999;
				strcpy(avalible_games[endgamenumber].word,""); 
				//Main server kill game server thread
				pthread_cancel(newgames[endgamenumber]);
				//Close socket of this thread (menu) to end managing of game
				close(cl.sockno);
								
			break;
			default:
			break;
		}
		pthread_mutex_unlock(&mutex);
		memset(msg,'\0',sizeof(msg));
	}
	
	pthread_mutex_lock(&mutex);
	//Update list and number of players in menu.
	for(i = 0; i < n; i++) {
		if(clients[i] == cl.sockno) {
			j = i;
			while(j < n-1) {
				clients[j] = clients[j+1];
				j++;
			}
		}
	}
	n--;
	pthread_mutex_unlock(&mutex);

	pthread_exit(NULL);
}

//Main server:
//Forgot to add functionality of choose IP of server and games...
//maybe someday.
int main(){

	struct sockaddr_in my_addr,their_addr;
	int my_sock;
	int their_sock;
	socklen_t their_addr_size;
	pthread_t recvt;
	struct client_info cl;
	char ip[INET_ADDRSTRLEN];
	
	my_sock = socket(AF_INET,SOCK_STREAM,0);
	memset(my_addr.sin_zero,'\0',sizeof(my_addr.sin_zero));
	my_addr.sin_family = AF_INET;
	my_addr.sin_port = htons(masterserverPORT);
	my_addr.sin_addr.s_addr = inet_addr("127.0.0.1");
	their_addr_size = sizeof(their_addr);

	if(bind(my_sock,(struct sockaddr *)&my_addr,sizeof(my_addr)) != 0) {
		perror("binding unsuccessful");
		close(my_sock);
		exit(1);
	}

	if(listen(my_sock,50) != 0) {
		perror("listening unsuccessful");
		exit(1);
	}
	//Main loop of main server
	//Server is normal TCP server
	while(1) {
		if((their_sock = accept(my_sock,(struct sockaddr *)&their_addr,&their_addr_size)) < 0) {
			perror("accept unsuccessful");
			exit(1);
		}
		pthread_mutex_lock(&mutex);
		inet_ntop(AF_INET, (struct sockaddr *)&their_addr, ip, INET_ADDRSTRLEN);
		cl.sockno = their_sock;
		strcpy(cl.ip,ip);
		clients[n] = their_sock;//Add new player
		n++;
		pthread_create(&recvt,NULL,recvmg,&cl);//Create thread for menu and new player
		pthread_mutex_unlock(&mutex);
	}
	close(my_sock);
	return 0;
} 