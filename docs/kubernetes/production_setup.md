# EduFlex Production Deployment Guide (Kubernetes)

Denna guide täcker uppsättning av en produktionsmiljö för EduFlex på ett molnbaserat Kubernetes-kluster (t.ex. DigitalOcean Kubernetes eller AWS EKS).

## 1. Helm-baserad Setup

Vi rekommenderar att använda Helm för att hantera releaser och versionshantering av infrastrukturen.

### values.yaml (Exempel för produktion)
```yaml
global:
  domain: eduflexlms.se
  environment: production

backend:
  replicas: 3
  resources:
    requests:
      cpu: "500m"
      memory: "1Gi"
    limits:
      cpu: "1000m"
      memory: "2Gi"
  autoscaling:
    enabled: true
    minReplicas: 3
    maxReplicas: 10
    targetCPUUtilizationPercentage: 70

postgresql:
  persistence:
    size: 20Gi
    storageClass: "do-block-storage" # För DigitalOcean
```

## 2. Horizontal Pod Autoscaling (HPA)

För att hantera belastningstoppar (t.ex. vid terminsstart) används HPA.

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: eduflex-backend-hpa
  namespace: eduflex
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: eduflex-backend
  minReplicas: 3
  maxReplicas: 15
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## 3. Storage & Persistence

I produktion använder vi molnspecifika lösningar istället för lokala mappar.
- **MinIO**: Kan köras i klustret med AWS S3-backend eller direkt mot molnbaserad objektlagring.
- **Database**: Rekommenderas "Managed Database" (t.ex. DigitalOcean Managed Databases) för automatisk backup och hög tillgänglighet.

## 4. Kostnadskalkyl (Estimated @ 500 users)

| Resurs | Konfiguration | Pris (Mån) |
| :--- | :--- | :--- |
| **K8s Nodes** | 3x 4GB Nodes | ~$120 |
| **Managed DB** | 2 vCPU, 4GB RAM | ~$60 |
| **Load Balancer** | 1x Standard | ~$12 |
| **Storage** | 100GB Object/Block | ~$10 |
| **Totalt** | | **~$202/mån** |

---
**Status: Redo för produktion**
