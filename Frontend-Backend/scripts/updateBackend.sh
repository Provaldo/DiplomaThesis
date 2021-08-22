/usr/local/bin/kubectl delete -f ../kubernetes/backend-deployment.yaml &&
/usr/bin/docker build -t provaldo/dipl-backend:k8s ../express-backend/ &&
/usr/bin/docker push provaldo/dipl-backend:k8s &&
/usr/local/bin/kubectl apply -f ../kubernetes/backend-deployment.yaml