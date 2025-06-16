/*
Copyright 2022 labring.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package controllers

import (
	"fmt"
	"path/filepath"
	"testing"

	"github.com/labring/sealos/controllers/user/controllers/helper/kubeconfig"

	csrv1 "k8s.io/api/certificates/v1"
	"k8s.io/client-go/kubernetes/scheme"
	"k8s.io/client-go/rest"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/envtest"
	logf "sigs.k8s.io/controller-runtime/pkg/log"
	"sigs.k8s.io/controller-runtime/pkg/log/zap"

	"k8s.io/client-go/tools/clientcmd"

	v1 "github.com/labring/sealos/controllers/user/api/v1"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	//+kubebuilder:scaffold:imports
)

// These tests use Ginkgo (BDD-style Go testing framework). Refer to
// http://onsi.github.io/ginkgo/ to learn more about Ginkgo.
var cfg *rest.Config
var k8sClient client.Client
var testEnv *envtest.Environment

func TestControllers(t *testing.T) {
	RegisterFailHandler(Fail)

	RunSpecs(t, "run controllers suite")
}

var _ = BeforeSuite(func() {
	logf.SetLogger(zap.New(zap.WriteTo(GinkgoWriter), zap.UseDevMode(true)))

	By("bootstrapping test environment")
	truePtr := true
	testEnv = &envtest.Environment{
		UseExistingCluster:    &truePtr,
		CRDDirectoryPaths:     []string{filepath.Join("..", "config", "crd", "bases")},
		ErrorIfCRDPathMissing: true,
	}

	var err error
	// cfg is defined in this file globally.
	cfg, err = testEnv.Start()
	Expect(err).NotTo(HaveOccurred())
	Expect(cfg).NotTo(BeNil())

	err = csrv1.AddToScheme(scheme.Scheme)
	Expect(err).NotTo(HaveOccurred())

	err = v1.AddToScheme(scheme.Scheme)
	Expect(err).NotTo(HaveOccurred())

	//+kubebuilder:scaffold:scheme

	k8sClient, err = client.New(cfg, client.Options{Scheme: scheme.Scheme})
	Expect(err).NotTo(HaveOccurred())
	Expect(k8sClient).NotTo(BeNil())

}, 60)

var _ = AfterSuite(func() {
	By("tearing down the test environment")
	err := testEnv.Stop()
	Expect(err).NotTo(HaveOccurred())
})

var _ = Describe("user kubeconfig ", func() {
	Context("syncReNewConfig test", func() {
		AfterEach(func() {

		})
		It("empty kubeconfig", func() {
			usr := &v1.User{}
			usr.Name = "cuisongliu"
			cfg, event, err := syncReNewConfig(usr)
			//Expect(err).NotTo(HaveOccurred())
			Expect(err).To(BeNil())
			Expect(event).To(BeNil())
			Expect(cfg).To(BeNil())
		})

		It("new expired kubeconfig", func() {
			usr := &v1.User{}
			usr.Name = "f8699ded-58d3-432b-a9ff-56568b57a38d"
			kubeConfig := `apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUM2VENDQWRHZ0F3SUJBZ0lCQURBTkJna3Foa2lHOXcwQkFRc0ZBREFWTVJNd0VRWURWUVFERXdwcmRXSmwKY201bGRHVnpNQ0FYRFRJeU1EY3pNVEUwTkRJME1sb1lEekl4TWpJd056QTNNVFEwTWpReVdqQVZNUk13RVFZRApWUVFERXdwcmRXSmxjbTVsZEdWek1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBCnVzS3Z4U1RUNFdXUUhOM0VvZmtoT0kyV1FMMWs4UTJxUWRZMklNNTBDT3NycmVuTW5tMzhpSmJONEgwTlpmQkUKZ3lYNzEvNG81WmxmUEdWRFdjL01qNkJQQXAzcEYrdVZQdnFQc1pKNUdKa2pNbGMzdWRVNzkxcC9jRlc5dUcxSQp6U01HVVRyL0V4d2UxVVZWd3NkZTdVMVpUZGhOajdPbmJQd0F1dGJVVEVxdmtIWEFpSW11K0NLaFRnRjVRVTZwCkI0T2luRVk2dWFOMWtFbzFXSUJFODlockNmSzhCeXV5V1dNTFY1RktaZjg5Ry9XNmh3T0F3Qjc2bGlabC8zTEMKTEdLdS8xWnh3VUw4QW54TWxBRi9RVFprK0ZaSkloVVFHbWlreVRwdi8vYWNyeUhXSWxHSmRPeGl6T2tUSnUzKwppMUZPR2JIR0xCZ3lnejdyc0RYMTB3SURBUUFCbzBJd1FEQU9CZ05WSFE4QkFmOEVCQU1DQXFRd0R3WURWUjBUCkFRSC9CQVV3QXdFQi96QWRCZ05WSFE0RUZnUVVJbUZKVGtEMTc3OUhZVTRpNjlHbzlLczRXM0V3RFFZSktvWkkKaHZjTkFRRUxCUUFEZ2dFQkFHb2FkSEUvbGg5ZnpGSUhoRUhJUTNQSEdaOVQ2K0NOL040cG5hcGcyUFY4U09XNwpOTmVTTXZpWmJxQk5VaG1kelNiaG5sTGllRWZHYlBjSm9BVThvdUN6bXFidXFzK3pDN3U1RnBrb0loYUJ1RHdSCm5ucmJXR1Z3cE93K1RvcjhmL1NyTGxxZVl3SFhneGprMGpmaEcwM1FRQUxvb3lBRWFEWjVPU0dyWHo0SWlkYTQKVHJwZmJZcjFvWE54UjllcFRkdDJIRTZoUlEyNEVUVXBjRVRqa01uSWtObWdLdnJHSndMUUF4b0d4QklqSUh4NApQZEdlOHdURit5V3I5WlNDWkNNZ0NNR2xuSVJtdXEyVzRQWklFdU8xUkZ3RDNCTVAyQmlsNEVWekhaZlpuUkVRClZRTDI0M08xangvb3gwaGlUOWRXRXBpbXZoMm1md0hNbzlSS2d4dz0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=
    server: https://192.168.64.24:6443
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
    client-certificate-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURTRENDQWpDZ0F3SUJBZ0lRYldZeDZSS3dOQ1M5L29oQTArMkZ4ekFOQmdrcWhraUc5dzBCQVFzRkFEQVYKTVJNd0VRWURWUVFERXdwcmRXSmxjbTVsZEdWek1CNFhEVEl5TURneU1EQTFNalkxT0ZvWERUSXlNRGd5TURBMgpNekUxT0Zvd0x6RXRNQ3NHQTFVRUF4TWtaamcyT1Rsa1pXUXROVGhrTXkwME16SmlMV0U1Wm1ZdE5UWTFOamhpCk5UZGhNemhrTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUEzQmRFa0VFNy9tTjQKWllTUkIvSW5JSGpMeW9DNHZKeUUreHM2bkczdXc3VjROdm1ia0ROSU9uS2cvQW9uNE1TNWhHbHJ1S0VydnJWSQo0L0pjTnFNMXFxTTVWVWVMRXVjVzU3cXE3QkdDbmZQSW9ndEd1YmpZRTJpWXhhYU8ySFVuSHF0VWNUajZDbTd1Ck1PWVA2di9tMkRZWjNxTDdjYTRjc1MzcVp1aW5oTG5ML1hJQXMwZUg3SmRnQkJISW1aVUlrRW9ueUNvNzI5VGkKZkFEdWhiQjZ1REtiRmFsMlAwQzZ5a1ltU2VVNHVHaytXQ0pDeDF2Nkd5THIzWXo1cHh6bXd4ck5CUUF2d2hYTwpQMFczVUZ1Rnc5MGlwQTN1dXpaT09aakxpd2U1N1ZnT1ZxbFFpMGY4SFFmYWRBUU8vTnFVc1lTQTk5K2ZzSXFoClJWK3Z5RUtITndJREFRQUJvM293ZURBT0JnTlZIUThCQWY4RUJBTUNCYUF3RXdZRFZSMGxCQXd3Q2dZSUt3WUIKQlFVSEF3SXdEQVlEVlIwVEFRSC9CQUl3QURBZkJnTlZIU01FR0RBV2dCUWlZVWxPUVBYdnYwZGhUaUxyMGFqMApxemhiY1RBaUJnTlZIUkVFR3pBWmdoZGhjR2x6WlhKMlpYSXVZMngxYzNSbGNpNXNiMk5oYkRBTkJna3Foa2lHCjl3MEJBUXNGQUFPQ0FRRUFsK1BSN1NHVVZMdjQ0bC9mY1ducHJqcFZpanM2eGJpSm9mVGNSL0JaSnRGaWpTWjEKNlRJU0t1c3hjb2lzZE16M1dsVWsyREpPYlJVV2FKamY4VXRUdkZmR0Z3UEJHU1k5aGxtR0NENEpVeXJHWVBzawoyby9jTGVDVVRWQzJvd2FPOXVyRTdmOGR4eU4xMHliaGhaZ1BuM0xDUGtiL0hCTFNJWFNFcWxwd0NmeURaMXFHCkJMbkVpa2VuVnJXc1FHSVJ1Mk91WkJINjYyU1VjMkk5SHlHemorTm1UamRES1VHNnZHdkw3WGdJdlgreWhjTDMKcVBsbFR1aFlab0lZdkErS1p1MFdFQWoyQWkvVU5MU21IbktyQkF6bm1qeXVGY2JFZFpYZDFSVGQycytWd0FFSgoxMnVHbXhIank2WCsvb0NxY0d6ZXJYUVRDSmVGWi8wWTBVMFl4UT09Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K
    client-key-data: client-key-data
`
			usr.Status.KubeConfig = kubeConfig
			cfg, event, err := syncReNewConfig(usr)
			eventStr := fmt.Sprintf("ClientCertificateData %s is expired", usr.Name)
			Expect(err).To(BeNil())
			Expect(event).To(Equal(&eventStr))
			Expect(cfg).To(BeNil())
		})

		It("new kubeconfig", func() {
			user := &v1.User{}
			user.Name = "cuisongliu"
			defaultExpirationDuration := int32(100000000)
			user.Spec.CSRExpirationSeconds = defaultExpirationDuration
			defaultConfig := kubeconfig.NewConfig("cuisongliu", "", 100000000)
			config, err := defaultConfig.WithServiceAccountConfig("default", nil).Apply(cfg, k8sClient)
			Expect(err).To(BeNil())
			kubeData, err := clientcmd.Write(*config)
			Expect(err).To(BeNil())
			user.Status.KubeConfig = string(kubeData)
			newCfg, event, err := syncReNewConfig(user)
			Expect(err).To(BeNil())
			Expect(event).To(BeNil())
			Expect(newCfg).NotTo(BeNil())
		})

	})
})
