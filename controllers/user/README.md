# add user

create user:

```yaml
apiVersion: user.sealos.io/v1
kind: User
metadata:
  name: f8699ded-58d3-432b-a9ff-56568b57a38d
spec:
  displayName: cuisongliu
  csrExpirationSeconds: 1000000000

```

show all resources:

```yaml
apiVersion: v1
items:
- apiVersion: user.sealos.io/v1
  kind: User
  metadata:
    creationTimestamp: "2022-09-07T14:06:56Z"
    finalizers:
    - sealos.io/user.finalizers
    generation: 1
    name: f8699ded-58d3-432b-a9ff-56568b57a38d
    resourceVersion: "81068"
    uid: dc25db9a-3c07-411a-9d0f-d77a943cfd07
  spec:
    csrExpirationSeconds: 1000000000
    displayName: cuisongliu
- apiVersion: user.sealos.io/v1
  kind: UserGroup
  metadata:
    annotations:
      user.sealos.io/creator: f8699ded-58d3-432b-a9ff-56568b57a38d
    creationTimestamp: "2022-09-07T14:06:56Z"
    finalizers:
    - sealos.io/user.group.finalizers
    generation: 1
    name: ug-f8699ded-58d3-432b-a9ff-56568b57a38d
    ownerReferences:
    - apiVersion: user.sealos.io/v1
      blockOwnerDeletion: true
      controller: true
      kind: User
      name: f8699ded-58d3-432b-a9ff-56568b57a38d
      uid: dc25db9a-3c07-411a-9d0f-d77a943cfd07
    resourceVersion: "81052"
    uid: 2e2a0e63-8510-4527-9cd5-b36085760ed9
- apiVersion: user.sealos.io/v1
  kind: UserGroupBinding
  metadata:
    annotations:
      user.sealos.io/creator: f8699ded-58d3-432b-a9ff-56568b57a38d
    creationTimestamp: "2022-09-07T14:06:56Z"
    finalizers:
    - sealos.io/user.group.binding.finalizers
    generation: 1
    name: ugn-f8699ded-58d3-432b-a9ff-56568b57a38d
    ownerReferences:
    - apiVersion: user.sealos.io/v1
      blockOwnerDeletion: true
      controller: true
      kind: User
      name: f8699ded-58d3-432b-a9ff-56568b57a38d
      uid: dc25db9a-3c07-411a-9d0f-d77a943cfd07
    resourceVersion: "81057"
    uid: 4d0bf140-f31f-4413-a276-4810566eb873
  roleRef: user
  subject:
    kind: Namespace
    name: ns-f8699ded-58d3-432b-a9ff-56568b57a38d
  userGroupRef: ug-f8699ded-58d3-432b-a9ff-56568b57a38d
- apiVersion: user.sealos.io/v1
  kind: UserGroupBinding
  metadata:
    annotations:
      user.sealos.io/creator: f8699ded-58d3-432b-a9ff-56568b57a38d
    creationTimestamp: "2022-09-07T14:06:56Z"
    finalizers:
    - sealos.io/user.group.binding.finalizers
    generation: 1
    name: ugu-f8699ded-58d3-432b-a9ff-56568b57a38d
    ownerReferences:
    - apiVersion: user.sealos.io/v1
      blockOwnerDeletion: true
      controller: true
      kind: UserGroup
      name: ug-f8699ded-58d3-432b-a9ff-56568b57a38d
      uid: 2e2a0e63-8510-4527-9cd5-b36085760ed9
    resourceVersion: "82412"
    uid: be7d630b-5ecc-4fc8-8dff-9b25a5ea9538
  roleRef: user
  subject:
    apiGroup: user.sealos.io
    kind: User
    name: f8699ded-58d3-432b-a9ff-56568b57a38d
  userGroupRef: ug-f8699ded-58d3-432b-a9ff-56568b57a38d
kind: List
metadata:
  resourceVersion: ""
```

# add userGroup
```yaml
apiVersion: user.sealos.io/v1
kind: UserGroup
metadata:
  annotations:
    user.sealos.io/creator: f8699ded-58d3-432b-a9ff-56568b57a38d
  creationTimestamp: "2022-09-07T14:06:56Z"
  finalizers:
  - sealos.io/user.group.finalizers
  generation: 1
  name: ug-f8699ded-58d3-432b-a9ff-56568b57a38d
  ownerReferences:
  - apiVersion: user.sealos.io/v1
    blockOwnerDeletion: true
    controller: true
    kind: User
    name: f8699ded-58d3-432b-a9ff-56568b57a38d
    uid: dc25db9a-3c07-411a-9d0f-d77a943cfd07
  resourceVersion: "81052"
  uid: 2e2a0e63-8510-4527-9cd5-b36085760ed9
```
# add user to  userGroup
```yaml
apiVersion: user.sealos.io/v1
kind: UserGroupBinding
metadata:
  annotations:
    user.sealos.io/creator: f8699ded-58d3-432b-a9ff-56568b57a38d
  creationTimestamp: "2022-09-07T14:06:56Z"
  finalizers:
  - sealos.io/user.group.binding.finalizers
  generation: 1
  name: ugu-f8699ded-58d3-432b-a9ff-56568b57a38d
  ownerReferences:
  - apiVersion: user.sealos.io/v1
    blockOwnerDeletion: true
    controller: true
    kind: UserGroup
    name: ug-f8699ded-58d3-432b-a9ff-56568b57a38d
    uid: 2e2a0e63-8510-4527-9cd5-b36085760ed9
  resourceVersion: "82412"
  uid: be7d630b-5ecc-4fc8-8dff-9b25a5ea9538
roleRef: user
subject:
  apiGroup: user.sealos.io
  kind: User
  name: f8699ded-58d3-432b-a9ff-56568b57a38d
userGroupRef: ug-f8699ded-58d3-432b-a9ff-56568b57a38d
```
# add namespace to userGroup

```yaml
apiVersion: user.sealos.io/v1
kind: UserGroupBinding
metadata:
  annotations:
    user.sealos.io/creator: f8699ded-58d3-432b-a9ff-56568b57a38d
  creationTimestamp: "2022-09-07T14:06:56Z"
  finalizers:
    - sealos.io/user.group.binding.finalizers
  generation: 1
  name: ugn-f8699ded-58d3-432b-a9ff-56568b57a38d
  ownerReferences:
    - apiVersion: user.sealos.io/v1
      blockOwnerDeletion: true
      controller: true
      kind: User
      name: f8699ded-58d3-432b-a9ff-56568b57a38d
      uid: dc25db9a-3c07-411a-9d0f-d77a943cfd07
  resourceVersion: "81057"
  uid: 4d0bf140-f31f-4413-a276-4810566eb873
roleRef: user
subject:
  kind: Namespace
  name: ns-f8699ded-58d3-432b-a9ff-56568b57a38d
userGroupRef: ug-f8699ded-58d3-432b-a9ff-56568b57a38d
```

# add manager to userGroup

```yaml
apiVersion: user.sealos.io/v1
kind: UserGroupBinding
metadata:
  annotations:
    user.sealos.io/creator: f8699ded-58d3-432b-a9ff-56568b57a38d
  creationTimestamp: "2022-09-07T14:06:56Z"
  finalizers:
  - sealos.io/user.group.binding.finalizers
  generation: 1
  name: ugu-f8699ded-58d3-432b-a9ff-56568b57a38d
  ownerReferences:
  - apiVersion: user.sealos.io/v1
    blockOwnerDeletion: true
    controller: true
    kind: UserGroup
    name: ug-f8699ded-58d3-432b-a9ff-56568b57a38d
    uid: 2e2a0e63-8510-4527-9cd5-b36085760ed9
  resourceVersion: "82412"
  uid: be7d630b-5ecc-4fc8-8dff-9b25a5ea9538
roleRef: manager
subject:
  apiGroup: user.sealos.io
  kind: User
  name: f8699ded-58d3-432b-a9ff-56568b57a38d
userGroupRef: ug-f8699ded-58d3-432b-a9ff-56568b57a38d
```


# add webhook

```go

const (
	UserAnnotationOwnerKey   = "user.sealos.io/creator"
	UserAnnotationDisplayKey = "user.sealos.io/display-name"
)

const (
	UgNameLabelKey        = "user.sealos.io/usergroup.name"
	UgRoleLabelKey        = "user.sealos.io/usergroup.role"
	UgBindingKindLabelKey = "user.sealos.io/usergroupbinding.kind"
	UgBindingNameLabelKey = "user.sealos.io/usergroupbinding.name"
)
```

```yaml
apiVersion: v1
items:
- apiVersion: user.sealos.io/v1
  kind: User
  metadata:
    annotations:
      kubectl.kubernetes.io/last-applied-configuration: |
        {"apiVersion":"user.sealos.io/v1","kind":"User","metadata":{"annotations":{},"name":"f8699ded-58d3-432b-a9ff-56568b57a38d"},"spec":{"csrExpirationSeconds":1000000000}}
      user.sealos.io/display-name: f8699ded-58d3-432b-a9ff-56568b57a38d
    creationTimestamp: "2022-09-14T14:52:02Z"
    finalizers:
    - sealos.io/user.finalizers
    generation: 1
    name: f8699ded-58d3-432b-a9ff-56568b57a38d
    resourceVersion: "416042"
    uid: 48a7d9e6-5d15-4b26-923c-667d7b8c429f
  spec:
    csrExpirationSeconds: 1000000000
  status:
    conditions:
    - lastHeartbeatTime: "2022-09-14T14:52:00Z"
      lastTransitionTime: "2022-09-14T14:52:00Z"
      message: user has been initialized
      reason: Initialized
      status: "True"
      type: Initialized
    - lastHeartbeatTime: "2022-09-14T14:52:00Z"
      lastTransitionTime: "2022-09-14T14:52:00Z"
      message: sync kube config successfully
      reason: Ready
      status: "True"
      type: KubeConfigSyncReady
    - lastHeartbeatTime: "2022-09-14T14:52:00Z"
      lastTransitionTime: "2022-09-14T14:52:00Z"
      message: sync owner ug successfully
      reason: Ready
      status: "True"
      type: OwnerUGSyncReady
    - lastHeartbeatTime: "2022-09-14T14:52:00Z"
      lastTransitionTime: "2022-09-14T14:52:00Z"
      message: sync owner ug namespace binding successfully
      reason: Ready
      status: "True"
      type: OwnerUGNamespaceBindingSyncReady
    - lastHeartbeatTime: "2022-09-14T14:52:00Z"
      lastTransitionTime: "2022-09-14T14:52:00Z"
      message: User is available now
      reason: Ready
      status: "True"
      type: Ready
    kubeConfig: |
      apiVersion: v1
      clusters:
      - cluster:
          certificate-authority-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUM2VENDQWRHZ0F3SUJBZ0lCQURBTkJna3Foa2lHOXcwQkFRc0ZBREFWTVJNd0VRWURWUVFERXdwcmRXSmwKY201bGRHVnpNQ0FYRFRJeU1Ea3hOREExTlRRMU5Wb1lEekl4TWpJd09ESXhNRFUxTkRVMVdqQVZNUk13RVFZRApWUVFERXdwcmRXSmxjbTVsZEdWek1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBCjBMSndEbndvYzV2YittMkpadVplMnB3dkhWZHpyY21SRkdIaUVmQzg4L2hscjVDWllMSkZkNVc5WjRjUFU1VjMKY1NVNG8wL1J1bmNiclNpNmZrdTNFZ0lya1Z0UUkxUm5Ub3ExTUNFeXk1Q3ZvRlpETkMwSW5wRTY2Nng2S0xpagpRZTFyRXYrYmxZc3B4MnE4Tmhtek1zZWR3ZzZod1ErM2RoQ0U5ck9Vb3UwRHZwQ2VKVjAwazkweVRmZGNTN1c0CnJCbFZ1dUhtNVlVU1M3SEZubTBFMUZQd0RONXhNaG9vZmkyVGE3eTZPNzlBZTl5cDZDZlV4cFRra28vOGNwZUIKKzI3NzRNelYyZmJ4Yys0Ri9McWpRTms2VVpIOTlTT3gvTUZJLzFCZWVqeTA1OGdtQ2U3QUlkbEpCdnFQOWRXbwp0cEtlb1ZyN3Fkc0owSEhTeUhmaVNRSURBUUFCbzBJd1FEQU9CZ05WSFE4QkFmOEVCQU1DQXFRd0R3WURWUjBUCkFRSC9CQVV3QXdFQi96QWRCZ05WSFE0RUZnUVVlOW9SQmQ2UVBjNk1VNjcyQjAwOU9nR2VtVjB3RFFZSktvWkkKaHZjTkFRRUxCUUFEZ2dFQkFEYkVDMk9oWkpiUzZldUZmTFNEdG11VlNoc3dFbDRlMFBsWWhnYTBKRHlQSDBUZQpCNmdPWVhZSndrZWxhTWxTUTFFY3ZVa3FHWlhqVUw4Qnl4YzJ0K0pxUDYzQ3ZtZHVzY0NHcWQzTDZTY21UQmZvCjhhbmpENmtoSDZBaHNPVnVsODFYcU9iV2Zxd0diTytGZFgvQi81TDB4bUQ0WUtnNE9iMzdlMWxXb2xJbEJZWmYKMEhqZGNMNjFyYytyWEloeGFPMmlzWHJiSmxzQ0hwTERoVkVKM2o0cjJWdkJFbjRMYWxlZmlYdVdrU3M4RmF0Nwo3N1hwSmhIblA5SHlma0Z1UERsRmpyN1FpcE9wRnJKUXBaeHhmSmREVEhFWUpRV3V0ZytqZjhVZzQweGg5ZS9GCnBNdDlNcTVKSGt3YWVPOEhpSmhaN2dxNjJBQTdseVp4TzBDbnhUYz0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=
          server: https://192.168.64.29:6443
        name: sealos
      contexts:
      - context:
          cluster: sealos
          user: f8699ded-58d3-432b-a9ff-56568b57a38d
        name: f8699ded-58d3-432b-a9ff-56568b57a38d@sealos
      current-context: f8699ded-58d3-432b-a9ff-56568b57a38d@sealos
      kind: Config
      preferences: {}
      users:
      - name: f8699ded-58d3-432b-a9ff-56568b57a38d
        user:
          client-certificate-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURKekNDQWcrZ0F3SUJBZ0lSQU9SY1E5Nnc5UHh6MjBTQXNOKzVoa1V3RFFZSktvWklodmNOQVFFTEJRQXcKRlRFVE1CRUdBMVVFQXhNS2EzVmlaWEp1WlhSbGN6QWdGdzB5TWpBNU1UUXhORFEzTURKYUdBOHlNRFUwTURVeQpNekUyTXpNME1sb3dMekV0TUNzR0ExVUVBeE1rWmpnMk9UbGtaV1F0TlRoa015MDBNekppTFdFNVptWXROVFkxCk5qaGlOVGRoTXpoa01JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBMnB4VHVwNHUKR0xzeVQ1a1RBeldrZGlTSUtnY09OTTkxU3FLV25CM2t1ektaKzUvWkdiT1MrWElGV3IrbEdtbkZnMUY0Sng5Ywpvb3I0K09KTnBSWHdpNElkejgvRVllbGU0cmU1bjE3enlvUHFLWFBGemdjM1pOc2d0Ni9WQm5ENVBYaUlvc3pECnI0dC9RQWh3SFA0VjVyTkIrTUJHbjdtMzJaY1UxNTlFak5sOVJjQWhNZHJWKzAvRVZNN1ZGVThVVnhzZWV1c1QKQlBvTDJOanZwek1NY0VTeFpsY3lVS1lpNG5TamtXR3ZOSnZja1BDaTFHaUhUc1lZZE1qKzRFQTZmZnRKRC9IYwprMkVCWVVVQmlWeXRtVUNRSEZIWm5rU0Eva1FwUFpHVll0Y1VTaDB1bmY4cWwyM2k1RUVsL3M1eTRjSmI0SVdmCmY3anpaWk9uTmpBVlVRSURBUUFCbzFZd1ZEQU9CZ05WSFE4QkFmOEVCQU1DQmFBd0V3WURWUjBsQkF3d0NnWUkKS3dZQkJRVUhBd0l3REFZRFZSMFRBUUgvQkFJd0FEQWZCZ05WSFNNRUdEQVdnQlI3MmhFRjNwQTl6b3hUcnZZSApUVDA2QVo2WlhUQU5CZ2txaGtpRzl3MEJBUXNGQUFPQ0FRRUFGdHNUOFlaS1dNelEydUIzZVZqeVVaRXM5dEY4Cms3MXk4YVZIV2owcEVFSTgzUlpSUjNMbzg5V3l4a3p6c0N2NjZYSkdKVHRzWFlYdTVjL1FpZ3NHemhGRTB0WlAKeGRIc3Y4SzRVelZablhSc2Y5U3BWcmNTQnR6WHEveEw5bXJ4VCtLcklBTEEzYUxQTUpsRGs2bnNuNnlRc0J2egpvWHBJbWlkblVnQWNydmxMSFFSMTRaSHU3dEFaVmh5blFJTGNJRjhaUnpvYnhpclNPM0ZVUkhpMFZPaHRWMUpaCi93NzhwNVhWZ3NYT2ozUmliWm9qUkdUT2w1b0xlUHBaT0xueHZoYkNaMjBmV2FBaHliMlhNSzZiQmR6ckZUbWUKR2VPdGFUWEt2UTE3cXJZTjVKVTVKQ0JhaWFRbjEyZjA1c3E2U0NtUVJVRWxpVmQ1VERiNS9ydVpZUT09Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K
          client-key-data: client-key-data
    observedCSRExpirationSeconds: 1000000000
    observedGeneration: 1
    phase: Active
- apiVersion: user.sealos.io/v1
  kind: UserGroup
  metadata:
    annotations:
      user.sealos.io/creator: f8699ded-58d3-432b-a9ff-56568b57a38d
      user.sealos.io/display-name: ug-f8699ded-58d3-432b-a9ff-56568b57a38d
    creationTimestamp: "2022-09-14T14:52:02Z"
    finalizers:
    - sealos.io/user.group.finalizers
    generation: 1
    name: ug-f8699ded-58d3-432b-a9ff-56568b57a38d
    ownerReferences:
    - apiVersion: user.sealos.io/v1
      blockOwnerDeletion: true
      controller: true
      kind: User
      name: f8699ded-58d3-432b-a9ff-56568b57a38d
      uid: 48a7d9e6-5d15-4b26-923c-667d7b8c429f
    resourceVersion: "416046"
    uid: c0b1faf8-3cc4-4817-bd28-e508eb3ab0f4
  status:
    conditions:
    - lastHeartbeatTime: "2022-09-14T14:52:00Z"
      lastTransitionTime: "2022-09-14T14:52:00Z"
      message: user group has been initialized
      reason: Initialized
      status: "True"
      type: Initialized
    - lastHeartbeatTime: "2022-09-14T14:52:00Z"
      lastTransitionTime: "2022-09-14T14:52:00Z"
      message: sync owner ug user binding successfully
      reason: Ready
      status: "True"
      type: OwnerUGUserBindingSyncReady
    - lastHeartbeatTime: "2022-09-14T14:52:00Z"
      lastTransitionTime: "2022-09-14T14:52:00Z"
      message: UserGroup is available now
      reason: Ready
      status: "True"
      type: Ready
    observedGeneration: 1
    phase: Active
- apiVersion: user.sealos.io/v1
  kind: UserGroupBinding
  metadata:
    annotations:
      user.sealos.io/creator: f8699ded-58d3-432b-a9ff-56568b57a38d
    creationTimestamp: "2022-09-14T14:52:02Z"
    finalizers:
    - sealos.io/user.group.binding.finalizers
    generation: 1
    labels:
      user.sealos.io/usergroup.name: ug-f8699ded-58d3-432b-a9ff-56568b57a38d
      user.sealos.io/usergroup.role: user
      user.sealos.io/usergroupbinding.kind: namespace
      user.sealos.io/usergroupbinding.name: ns-f8699ded-58d3-432b-a9ff-56568b57a38d
    name: ugn-f8699ded-58d3-432b-a9ff-56568b57a38d
    ownerReferences:
    - apiVersion: user.sealos.io/v1
      blockOwnerDeletion: true
      controller: true
      kind: User
      name: f8699ded-58d3-432b-a9ff-56568b57a38d
      uid: 48a7d9e6-5d15-4b26-923c-667d7b8c429f
    resourceVersion: "422287"
    uid: 3ac62863-d9a1-4159-bc45-fe4c71d691de
  roleRef: user
  status:
    conditions:
    - lastHeartbeatTime: "2022-09-14T14:52:00Z"
      lastTransitionTime: "2022-09-14T14:52:00Z"
      message: user group binding has been initialized
      reason: Initialized
      status: "True"
      type: Initialized
    - lastHeartbeatTime: "2022-09-14T14:52:00Z"
      lastTransitionTime: "2022-09-14T14:52:00Z"
      message: sync ug namespace successfully
      reason: Ready
      status: "True"
      type: UGNamespaceSyncReady
    - lastHeartbeatTime: "2022-09-14T14:52:00Z"
      lastTransitionTime: "2022-09-14T14:52:00Z"
      message: sync ug namespace binding successfully
      reason: Ready
      status: "True"
      type: UGNamespaceBindingSyncReady
    - lastHeartbeatTime: "2022-09-14T14:52:00Z"
      lastTransitionTime: "2022-09-14T14:52:00Z"
      message: UserGroupBinding is available now
      reason: Ready
      status: "True"
      type: Ready
    observedGeneration: 1
    phase: Active
  subject:
    kind: Namespace
    name: ns-f8699ded-58d3-432b-a9ff-56568b57a38d
  userGroupRef: ug-f8699ded-58d3-432b-a9ff-56568b57a38d
- apiVersion: user.sealos.io/v1
  kind: UserGroupBinding
  metadata:
    annotations:
      user.sealos.io/creator: f8699ded-58d3-432b-a9ff-56568b57a38d
    creationTimestamp: "2022-09-14T14:52:02Z"
    finalizers:
    - sealos.io/user.group.binding.finalizers
    generation: 1
    labels:
      user.sealos.io/usergroup.name: ug-f8699ded-58d3-432b-a9ff-56568b57a38d
      user.sealos.io/usergroup.role: user
      user.sealos.io/usergroupbinding.kind: user
      user.sealos.io/usergroupbinding.name: f8699ded-58d3-432b-a9ff-56568b57a38d
    name: ugu-f8699ded-58d3-432b-a9ff-56568b57a38d
    ownerReferences:
    - apiVersion: user.sealos.io/v1
      blockOwnerDeletion: true
      controller: true
      kind: UserGroup
      name: ug-f8699ded-58d3-432b-a9ff-56568b57a38d
      uid: c0b1faf8-3cc4-4817-bd28-e508eb3ab0f4
    resourceVersion: "419386"
    uid: b6cbea8a-a248-4bb1-a9ae-30ba39db072f
  roleRef: user
  status:
    conditions:
    - lastHeartbeatTime: "2022-09-14T14:52:00Z"
      lastTransitionTime: "2022-09-14T14:52:00Z"
      message: user group binding has been initialized
      reason: Initialized
      status: "True"
      type: Initialized
    - lastHeartbeatTime: "2022-09-14T14:52:00Z"
      lastTransitionTime: "2022-09-14T14:52:00Z"
      message: sync ug user binding by owner successfully
      reason: Ready
      status: "True"
      type: UGUserBindingSyncReadyByOwner
    - lastHeartbeatTime: "2022-09-14T14:52:00Z"
      lastTransitionTime: "2022-09-14T14:52:00Z"
      message: sync ug user binding successfully
      reason: Ready
      status: "True"
      type: UGUserBindingSyncReady
    - lastHeartbeatTime: "2022-09-14T14:52:00Z"
      lastTransitionTime: "2022-09-14T14:52:00Z"
      message: sync ug namespace binding successfully
      reason: Ready
      status: "True"
      type: UGNamespaceBindingSyncReady
    - lastHeartbeatTime: "2022-09-14T14:52:00Z"
      lastTransitionTime: "2022-09-14T14:52:00Z"
      message: UserGroupBinding is available now
      reason: Ready
      status: "True"
      type: Ready
    observedGeneration: 1
    phase: Active
  subject:
    apiGroup: user.sealos.io
    kind: User
    name: f8699ded-58d3-432b-a9ff-56568b57a38d
  userGroupRef: ug-f8699ded-58d3-432b-a9ff-56568b57a38d
kind: List
metadata:
  resourceVersion: ""
```

