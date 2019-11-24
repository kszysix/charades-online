#include "mcli.h"

#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <pthread.h>
#include <time.h>
//#define RAND_MAX 7

struct names{
	int firstPORTs;
	char name[10];
};

pthread_mutex_t mutexc = PTHREAD_MUTEX_INITIALIZER;

void *recvmgclient(void *sock)
{
	int their_sock = *((int *)sock);
	char msg[500];
	int len;
	while((len = recv(their_sock,msg,500,0)) > 0) {
		msg[len] = '\0';
		fputs(msg,stdout);
		//printf("Odebralem: %s\n",msg);
		memset(msg,'\0',sizeof(msg));
	}
}


void *mainclient(void *client)
{
	struct names me = *((struct names *)client);
	int firstPORTs = me.firstPORTs;

	struct sockaddr_in their_addr;
	int my_sock;
	int their_sock;
	int their_addr_size;
	int portno;
	pthread_t sendt,recvt;
	char msg[500];
	char username[100];
	char res[600];
	char ip[INET_ADDRSTRLEN];
	int len;

	portno = firstPORTs;
	strcpy(username,me.name);
	my_sock = socket(AF_INET,SOCK_STREAM,0);
	memset(their_addr.sin_zero,'\0',sizeof(their_addr.sin_zero));
	their_addr.sin_family = AF_INET;
	their_addr.sin_port = htons(portno);
	their_addr.sin_addr.s_addr = inet_addr("127.0.0.1");

	if(connect(my_sock,(struct sockaddr *)&their_addr,sizeof(their_addr)) < 0) {
		perror("connection not esatablished");
		exit(1);
	}
	inet_ntop(AF_INET, (struct sockaddr *)&their_addr, ip, INET_ADDRSTRLEN);
	printf("connected to %s, start chatting\n",ip);
	pthread_create(&recvt,NULL,recvmgclient,&my_sock);
 
	int r;
	int mod = 5;
	while(1) {
		pthread_mutex_lock(&mutexc);
		srand(time(NULL));  
		r = rand()%mod + 1;
		sleep(r);
//		char temp[10] = (char)r;
		//sprintf(temp,"%d\n",r);
		
		
		//printf("%d\n", r);
		
		char msg[100] = "mam czas ";

		strcat(msg,"X\n");
		strcpy(res,username);
		strcat(res," : ");
		strcat(res,msg);
		len = write(my_sock,res,strlen(res));
		//printf("%s\n",res);
		pthread_mutex_unlock(&mutexc);
		sleep(r);
		
		if(len < 0) {
			perror("message not sent");
			exit(1);
		}
		memset(msg,'\0',sizeof(msg));
		memset(res,'\0',sizeof(res));
	}
	pthread_join(recvt,NULL);
	close(my_sock);
	//return 11;
}