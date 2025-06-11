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
                script {
                    env.IMAGE_TAG = "build-${env.BUILD_NUMBER}"
                }
                dir('frontend') {
                    sh 'docker build -t omareltabakh/frontend:$IMAGE_TAG .'
                }
                dir('backend') {
                    sh 'docker build -t omareltabakh/backend:$IMAGE_TAG .'
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
                sh 'docker push omareltabakh/frontend:$IMAGE_TAG'
                sh 'docker push omareltabakh/backend:$IMAGE_TAG'
            }
        }

        stage('Update K8s Manifests') {
            steps {
                script {
                    sh """
                        sed -i 's|image: omareltabakh/backend:.*|image: omareltabakh/backend:$IMAGE_TAG|' kubernetes/backend/deployment.yaml
                        sed -i 's|image: omareltabakh/frontend:.*|image: omareltabakh/frontend:$IMAGE_TAG|' kubernetes/frontend/deployment.yaml
                    """
                }
            }
        }

        stage('Commit and Push YAML Changes') {
            steps {
                script {
                    sh """
                        git config user.email "jenkins@example.com"
                        git config user.name "Jenkins"
                        git add kubernetes/backend/deployment.yaml kubernetes/frontend/deployment.yaml
                        git commit -m "Update image tags to $IMAGE_TAG"
                        git push origin main
                    """
                }
            }
        }
    }
}
