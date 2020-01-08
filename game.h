#ifndef GAME_
#define GAME_

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

void sendtoall(char *msg,int curr);
void *recvmg(void *sock);
void *gamemain(void *inputargs);


#endif