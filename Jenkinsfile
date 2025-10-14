pipeline {
  agent any

  environment {
    AWS_REGION = 'ap-south-1'                         // change if needed
    AWS_ACCOUNT_ID = '045491855348'               // replace with your AWS account id
    ECR_REPO = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/cicd-lab-repo"
    IMAGE_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT}"
    ECS_CLUSTER = 'microservice-lab-cluster'                     // e.g., microservice-lab-cluster
    ECS_SERVICE = 'microservice-lab-service'                     // e.g., microservice-lab-service
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install & Test') {
      steps {
        // Use a node docker container to run npm install and tests (no Node install required on Jenkins)
        sh 'docker run --rm -v $PWD:/work -w /work node:18-alpine sh -c "npm ci && npm test"'
      }
    }

    stage('Build Docker Image') {
      steps {
        sh "docker build -t ${ECR_REPO}:${IMAGE_TAG} ."
      }
    }

    stage('Login to ECR & Push Image') {
      steps {
        // aws credentials stored in Jenkins as a username/password credential with id 'aws-creds'
        withCredentials([usernamePassword(credentialsId: 'aws-creds', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
          sh """
            mkdir -p ~/.aws
            aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
            aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
            aws configure set default.region ${AWS_REGION}

            aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

            docker push ${ECR_REPO}:${IMAGE_TAG}
          """
        }
      }
    }

    stage('Deploy to ECS (force new deployment)') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'aws-creds', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
          sh """
            aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
            aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
            aws configure set default.region ${AWS_REGION}

            aws ecs update-service --cluster ${ECS_CLUSTER} --service ${ECS_SERVICE} --force-new-deployment --region ${AWS_REGION}
          """
        }
      }
    }
  }

  post {
    always {
      echo "Cleaning up workspace..."
      sh 'docker image prune -f || true'
    }
  }
}
