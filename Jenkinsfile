pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
    }

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/OmarEltabakh123/Three-Tier-DevSecOps.git'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarQubeScanner'
                    withSonarQubeEnv('SonarQube') {
                        withCredentials([string(credentialsId: 'sonarqube-token', variable: 'TOKEN')]) {
                            sh """
                                ${scannerHome}/bin/sonar-scanner \
                                -Dsonar.projectKey=three-tier \
                                -Dsonar.sources=. \
                                -Dsonar.host.url=http://192.168.15.156:9000 \
                                -Dsonar.login=$TOKEN
                            """
                        }
                    }
                }
            }
        }

        stage('Trivy Scan') {
            steps {
                sh 'trivy fs --severity HIGH,CRITICAL .'
                sh 'trivy image --severity HIGH,CRITICAL omareltabakh/frontend:latest'
                sh 'trivy image --severity HIGH,CRITICAL omareltabakh/backend:latest'
            }
        }

        stage('Build Docker Images') {
            steps {
                dir('frontend') {
                    sh 'docker build -t omareltabakh/frontend:latest .'
                }
                dir('backend') {
                    sh 'docker build -t omareltabakh/backend:latest .'
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
                sh 'docker push omareltabakh/frontend:latest'
                sh 'docker push omareltabakh/backend:latest'
            }
        }

        stage('Update K8s Manifests') {
            steps {
                script {
                    sh """
                        # Update backend image tag
                        sed -i 's|image: omareltabakh/backend:.*|image: omareltabakh/backend:latest|' kubernetes/backend/deployment.yaml
                        
                        # Update frontend image tag
                        sed -i 's|image: omareltabakh/frontend:.*|image: omareltabakh/frontend:latest|' kubernetes/frontend/deployment.yaml
                    """
                }
            }
        }
    }
}
