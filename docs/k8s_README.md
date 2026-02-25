# EduFlex Kubernetes Deployment

Quick start guide for deploying EduFlex to Kubernetes.

## Prerequisites

- kubectl installed and configured
- Kubernetes cluster running (Docker Desktop, minikube, or cloud)
- Docker images built for backend and frontend

## Build Docker Images

```powershell
# Backend
cd eduflex
docker build -t eduflex/backend:latest .

# Frontend
cd ../frontend
docker build -t eduflex/frontend:latest .
```

## Deploy to Kubernetes

### 1. Create Namespace and Secrets
```powershell
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap-backend.yaml
```

### 2. Deploy Database Layer
```powershell
kubectl apply -f k8s/postgresql.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/minio.yaml
```

### 3. Wait for Database to be Ready
```powershell
kubectl wait --for=condition=ready pod -l app=postgresql -n eduflex --timeout=300s
```

### 4. Deploy Application Layer
```powershell
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
```

### 5. Deploy Ingress
```powershell
# Install Ingress Controller (if not already installed)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Deploy Ingress
kubectl apply -f k8s/ingress.yaml
```

## Verify Deployment

```powershell
# Check all pods
kubectl get pods -n eduflex

# Check services
kubectl get services -n eduflex

# Check ingress
kubectl get ingress -n eduflex

# Check HPA (auto-scaling)
kubectl get hpa -n eduflex
```

## Access Application

### Local (Docker Desktop / minikube)
```powershell
# Port-forward frontend
kubectl port-forward svc/frontend 3000:80 -n eduflex

# Port-forward backend
kubectl port-forward svc/backend 8080:8080 -n eduflex

# Access
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
```

### With Ingress
```
http://localhost
```

## Useful Commands

### View Logs
```powershell
# Backend logs
kubectl logs -f deployment/backend -n eduflex

# Frontend logs
kubectl logs -f deployment/frontend -n eduflex

# PostgreSQL logs
kubectl logs -f statefulset/postgresql -n eduflex
```

### Scale Manually
```powershell
# Scale backend
kubectl scale deployment backend --replicas=5 -n eduflex

# Scale frontend
kubectl scale deployment frontend --replicas=3 -n eduflex
```

### Update Deployment
```powershell
# Update backend image
kubectl set image deployment/backend backend=eduflex/backend:v2 -n eduflex

# Rollout status
kubectl rollout status deployment/backend -n eduflex

# Rollback if needed
kubectl rollout undo deployment/backend -n eduflex
```

### Delete Everything
```powershell
kubectl delete namespace eduflex
```

## Troubleshooting

### Pods not starting
```powershell
kubectl describe pod <pod-name> -n eduflex
kubectl logs <pod-name> -n eduflex
```

### Database connection issues
```powershell
# Check PostgreSQL is running
kubectl exec -it postgresql-0 -n eduflex -- psql -U postgres -c "SELECT 1"

# Check connectivity from backend
kubectl exec -it deployment/backend -n eduflex -- nc -zv postgresql 5432
```

### Auto-scaling not working
```powershell
# Check metrics server is installed
kubectl top nodes
kubectl top pods -n eduflex

# If not, install metrics server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

## Next Steps

- Configure TLS certificates for production
- Set up monitoring with Prometheus/Grafana
- [Produktionsmiljö & Skalbarhet (Helm)](./kubernetes/production_setup.md)
- [Simulerade Load-test Resultat](./kubernetes/load_test_results.md)
- Configure backup automation
- Implement CI/CD pipeline

---

**Developed by Alex Weström / Fenrir Studio**  
**© 2026 EduFlex™**
