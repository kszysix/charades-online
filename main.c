

#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <pthread.h>

#include "mser.h"
#include "mcli.h"


 // lastPORT = firstPORT + length(clients[])

char namesc[5][10] = {"Pawel","Wojtek","Zuza","Lena","Franek"};
struct names{
	int firstPORTs;
	char name[10];
};


int main(){
	printf("Zapraszamy na czat:\n");

	int firstPORT = 1002;

	pthread_t idc[5];
	pthread_t ids;


	pthread_create(&ids,NULL,mainserver,&firstPORT);
	sleep(2);
	int controlserver;
	int controlclient[5];
	for(int i = 0; i < 5; i++){
		struct names client;
		client.firstPORTs = firstPORT;
		//client.name = namesc[i];
		strcpy(client.name,namesc[i]);
		pthread_create(&idc[i],NULL,mainclient,&client);
	}



//--------------------
	char end[10];
	scanf("%s",end);

	printf("%s\n",end);

	for(int i = 0; i < 5; i++){
		pthread_join(idc[i],NULL);
	}

	pthread_join(ids,NULL);

	return 23;
}