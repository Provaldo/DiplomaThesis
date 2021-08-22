/usr/local/bin/kubectl delete -f ../kubernetes/frontend-deployment.yaml &&
/usr/bin/docker build -t provaldo/dipl-frontend:k8s ../react-frontend &&
/usr/bin/docker push provaldo/dipl-frontend:k8s &&
/usr/local/bin/kubectl apply -f ../kubernetes/frontend-deployment.yaml