# minikube
/usr/bin/minikube start
/usr/bin/minikube addons enable dashboard
/usr/bin/minikube addons enable metrics-server

# mongodb
/usr/local/bin/kubectl apply -f ../kubernetes/mongo-persistentvolume.yaml
/usr/local/bin/kubectl apply -f ../kubernetes/mongo-persistentvolumeclaim.yaml
/usr/local/bin/kubectl apply -f ../kubernetes/mongo-secret.yaml
/usr/local/bin/kubectl apply -f ../kubernetes/mongo-deployment.yaml

# backend
/usr/local/bin/kubectl apply -f ../kubernetes/mongo-configmap.yaml
/usr/local/bin/kubectl apply -f ../kubernetes/backend-rbac.yaml
/usr/local/bin/kubectl apply -f ../kubernetes/backend-deployment.yaml

# frontend
/usr/local/bin/kubectl apply -f ../kubernetes/frontend-configmap.yaml
/usr/local/bin/kubectl apply -f ../kubernetes/frontend-deployment.yaml
/usr/local/bin/kubectl apply -f ../kubernetes/frontend-service.yaml\

/usr/bin/minikube tunnel