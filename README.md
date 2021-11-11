# Project Title

**Implementation of a full stack tool in Kubernetes environment to automate the application of filters on messages using message broker technology**

## Overview

This project was created in the context of the diploma thesis of Emmanouil Zisis-Milis as an electrical & computer engineering student of the [Aristotle University of Thessaloniki](https://ee.auth.gr/).

The diploma thesis was supervised by:
- Symeonidis Andreas (Associate Professor of AuTh) ([linkedIn Profile](https://www.linkedin.com/in/andreas-symeonidis-3455843/))
- Tsardoulias Manos (Post-Doctoral Researcher of AuTh) ([linkedIn Profile](https://www.linkedin.com/in/konstantinos-panayiotou-b8111675/))
- Panayiotou Konstantinos (Doctoral Student of Auth) ([linkedIn Profile](https://www.linkedin.com/in/manos-tsardoulias-435a7a24/))

who are all members of the [Intelligent Systems & Software Engineering Labgroup](https://issel.ee.auth.gr/).

A web platform was created to enable its users to apply message filters to their systems through RabbitMQ message brokers, without having to write any code.

The web app that was produced, is set up in a local Kubernetes environment created by the Minikube tool.

The users' info as well as the messages that are deemed important are saved to a MongoDB Database.

## Table of contents

- [Project Title](#project-title)
- [Overview](#overview)
- [Table of contents](#table-of-contents)
- [List of features](#list-of-features)
- [Requirements](#requirements)
- [Installation directions](#installation-directions)
- [Platform setup](#platform-setup)
- [Footer](#footer)
<!--
- [Development](#development)
- [Contribute](#contribute)
    - [Sponsor](#sponsor)
    - [Adding new features or fixing bugs](#adding-new-features-or-fixing-bugs)
- [License](#license)
-->

## Requirements

This project was developed in a machine operating on Ubuntu OS, making use of Linux containers. For compatibility reasons it should be run on similar environments.

## List of features

- Through this web app, the user can spin up a personal RabbitMQ message broker through which his messages will be routed. 

- The user gets a local IP address to which he can send messages from his other systems / IoT devices.

- The user can apply and attach filters to his message broker by specifying the Exchanges and the Queues through which his messages will be routed.

- The user's messages are routed from the Topic Exchanges to the Queues according to the Routing Key of the messages and the Binding Keyes between Exchanges and Queues.

- The user can specify sets of conditions, under which the messages received by a filter will be considered important and saved to a Database.

- The user can observe the overview of the messaging system, either by accessing the management GUI of the RabbitMQ message broker, or by navigating to the built-in Overview tab of the web app.

[(Back to top)](#overview)

## Installation directions

1) Start here to install minikube:
https://minikube.sigs.k8s.io/docs/start/

2) Install docker
https://minikube.sigs.k8s.io/docs/drivers/docker/

3) This will lead to 
https://docs.docker.com/engine/install/ubuntu/

4) Following the steps required will lead to 
https://docs.docker.com/engine/install/linux-postinstall/
execute those steps 

  (the Docker start on boot step is optional)

  (The "Configure where the Docker daemon listens for connections" step is also optional)

5) Some optional training resource material:
https://docs.docker.com/get-started/,
https://docs.docker.com/develop/

[(Back to top)](#overview)

## Platform setup

1) To use this project, first clone the repo on your device using the command below:

``` sh
git init
```

``` sh
git clone https://github.com/Provaldo/DiplomaThesis.git
```

2) Navigate to the `scripts` folder of the project structure

3) a) Run the executable file `startScript.sh`

```
./startScript.sh
```

(the above will only work if the minikube executable is installed in the location

`/usr/bin/minikube`

and the kubectl tool is installed in the location

`/usr/local/bin/kubectl`

Otherwise the `startScript.sh` file needs to be adjusted to reflect the installed locations of the minikube and kubectl executables)

3) b) If one doesn't wish to alter the `startScript.sh` file, they can just execute one by one the commands it contains:

```
# minikube
minikube start --memory 6600 --cpus 4
minikube addons enable dashboard
minikube addons enable metrics-server

# mongodb
kubectl apply -f ../kubernetes/mongo-persistentvolume.yaml
kubectl apply -f ../kubernetes/mongo-persistentvolumeclaim.yaml
kubectl apply -f ../kubernetes/mongo-secret.yaml
kubectl apply -f ../kubernetes/mongo-deployment.yaml

# backend
kubectl apply -f ../kubernetes/mongo-configmap.yaml
kubectl apply -f ../kubernetes/backend-rbac.yaml
kubectl apply -f ../kubernetes/backend-deployment.yaml

# frontend
kubectl apply -f ../kubernetes/frontend-configmap.yaml
kubectl apply -f ../kubernetes/frontend-deployment.yaml
kubectl apply -f ../kubernetes/frontend-service.yaml\

# access to the system from LAN locations
minikube tunnel
```

4) Get the public `minikube` container IP address: 
```
minikube ip
# => 192.168.49.2
```

5) Use Public Minikube IP Address to Connect from a browser

  * `http://{minikube_ip}:31000`: 31000 is the Nodeport of the Frontend service

(notice how the protocol used is http and NOT https, otherwise the connection will not succeed)

6) To get an overview of the running containers, their address and port configurations execute in a terminal the following command:

``` sh
watch -x kubectl get all -o wide

```

[(Back to top)](#overview)

## Footer

![Footer](https://github.com/navendu-pottekkat/awesome-readme/blob/master/fooooooter.png)

[(Back to top)](#overview)
