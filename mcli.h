#ifndef MCLI_
#define MCLI_


#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <pthread.h>

void *recvmgclient(void *sock);
void *mainclient(void *inputPORT);


#endif