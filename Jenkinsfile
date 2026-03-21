pipeline {
    agent any
    tools { nodejs 'NodeJS-18' }
    environment {
        DEPLOY_PATH = '/var/www/jamalbarbers'
        VITE_API_URL = 'http://jamalsbarber.timetofit.in/api'
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-credentials-two',
                    url: 'https://github.com/timetofit2025/jamalsbarber_website_frontend.git'
            }
        }
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }
        stage('Build') {
            steps {
                sh 'npm run build'
                sh 'ls -la dist/'
            }
        }
        stage('Approval') {
            steps {
                timeout(time: 30, unit: 'MINUTES') {
                    input message: 'Deploy Jamal Barbers FRONTEND to production server?',
                          ok: 'Deploy Now'
                }
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying frontend to local server...'
                sh '''
                    # Remove old files
                    rm -rf /var/www/jamalbarbers/*
                    
                    # Copy new build files
                    cp -r dist/* /var/www/jamalbarbers/
                    
                    # Set proper permissions
                    chmod -R 755 /var/www/jamalbarbers/
                    
                    # Reload nginx
                    sudo systemctl reload nginx
                    
                    echo "✅ Frontend deployed successfully to /var/www/jamalbarbers/"
                '''
            }
        }
    }
    post {
        success {
            echo '✅ Jamal Barbers frontend deployed successfully!'
        }
        failure {
            echo '❌ Frontend deployment failed!'
        }
        aborted {
            echo '⛔ Deployment was cancelled!'
        }
    }
}
