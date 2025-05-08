// Copyright © 2023 sealos.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package env

import (
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"os"
	"strconv"
	"time"
)

func GetEnvWithDefault(key, defaultValue string) string {
	if value, ok := os.LookupEnv(key); ok && value != "" {
		return value
	}
	return defaultValue
}

func GetBoolWithDefault(key string, defaultValue bool) bool {
	if env, ok := os.LookupEnv(key); ok && env != "" {
		if value, err := strconv.ParseBool(env); err == nil {
			return value
		}
	}
	return defaultValue
}

func GetInt64EnvWithDefault(key string, defaultValue int64) int64 {
	if env, ok := os.LookupEnv(key); ok && env != "" {
		if value, err := strconv.ParseInt(env, 10, 64); err == nil {
			return value
		}
	}
	return defaultValue
}

func GetIntEnvWithDefault(key string, defaultValue int) int {
	return int(GetInt64EnvWithDefault(key, int64(defaultValue)))
}

func GetDurationEnvWithDefault(key string, defaultValue time.Duration) time.Duration {
	if env, ok := os.LookupEnv(key); ok && env != "" {
		if value, err := time.ParseDuration(env); err == nil {
			return value
		}
	}
	return defaultValue
}

func CheckEnvSetting(keys []string) error {
	for _, key := range keys {
		if val, ok := os.LookupEnv(key); !ok || val == "" {
			return fmt.Errorf("env %s not set", key)
		}
	}
	return nil
}

func GetTLSConfig(keyPrefix string) (*tls.Config, error) {
	caCertPEM := GetEnvWithDefault(keyPrefix+"_CA_CERT", "")
	certPEM := GetEnvWithDefault(keyPrefix+"_CERT", "")
	keyPEM := GetEnvWithDefault(keyPrefix+"_KEY", "")
	if caCertPEM == "" || certPEM == "" || keyPEM == "" {
		return nil, fmt.Errorf("env %s_CA_CERT, %s_CERT, %s_KEY not set", keyPrefix, keyPrefix, keyPrefix)
	}
	caCertPool := x509.NewCertPool()
	if ok := caCertPool.AppendCertsFromPEM([]byte(caCertPEM)); !ok {
		return nil, fmt.Errorf("failed to append ca cert")
	}
	cert, err := tls.X509KeyPair([]byte(certPEM), []byte(keyPEM))
	if err != nil {
		return nil, fmt.Errorf("failed to load x509 key pair: %w", err)
	}
	return &tls.Config{
		RootCAs:      caCertPool,
		Certificates: []tls.Certificate{cert},
	}, nil
}
