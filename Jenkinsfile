// Jenkinsfile (in React project root)
pipeline {
    agent any
    tools { nodejs 'NodeJS-18' }

    environment {
        SERVER_IP   = '72.62.132.163'
        DEPLOY_PATH = '/var/www/jamalbarbers'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/timetofit2025/jamalsbarber_website_frontend.git',
                    credentialsId: 'github-credentials'
            }
        }

        stage('Install') {
            steps { sh 'npm ci' }
        }

        stage('Build') {
            steps {
                // Use production env
                sh 'npm run build'
                sh 'ls -la dist/'
            }
        }

        stage('Approval') {
            steps {
                timeout(time: 30, unit: 'MINUTES') {
                    input(
                        message: 'Deploy Jamal Barbers FRONTEND to production server?',
                        ok: 'Deploy Now',
                        submitter: 'admin'
                    )
                }
            }
        }

        stage('Deploy') {
            steps {
                sshagent(['server-ssh-key']) {
                    sh """
                        # Backup existing (safety)
                        ssh ubuntu@${SERVER_IP} \
                            'cp -r ${DEPLOY_PATH} ${DEPLOY_PATH}_backup 2>/dev/null || true'

                        # Clear old build
                        ssh ubuntu@${SERVER_IP} \
                            'rm -rf ${DEPLOY_PATH}/*'

                        # Copy new build
                        scp -r dist/* ubuntu@${SERVER_IP}:${DEPLOY_PATH}/

                        # Reload Nginx — zero downtime
                        # Existing site on 5173/8081 stays untouched
                        ssh ubuntu@${SERVER_IP} \
                            'sudo systemctl reload nginx'

                        echo "Frontend deployed successfully"
                    """
                }
            }
        }
    }

    post {
        success { echo 'Jamal Barbers frontend is LIVE' }
        failure {
            sshagent(['server-ssh-key']) {
                sh """
                    # Auto-rollback on failure
                    ssh ubuntu@${SERVER_IP} \
                        'cp -r ${DEPLOY_PATH}_backup/* ${DEPLOY_PATH}/ 2>/dev/null || true'
                """
            }
            echo 'Deployment failed — rolled back to previous version'
        }
        aborted { echo 'Deployment cancelled at approval stage' }
    }
}