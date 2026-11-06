pipeline {
    agent any

    environment {
        APP_NAME = "devops-dashboard"
    }

    stages {
        stage('1. Checkout') {
            steps {
                echo "Recupero del codice sorgente dal repository..."
                checkout scm
            }
        }

        stage('2. Test Backend con Pytest') {
            steps {
                echo "Esecuzione test unitari e di integrazione..."
                // Crea un ambiente virtuale temporaneo ed esegue i test
                sh '''
                    cd backend
                    python3 -m venv venv_ci || true
                    . venv_ci/bin/activate
                    pip install --upgrade pip
                    pip install -r requirements.txt
                    pytest -v
                '''
            }
        }

        stage('3. Build Verifica Frontend') {
            steps {
                echo "Verifica della compilazione del Frontend React..."
                sh '''
                    cd frontend
                    npm ci
                    npm run build
                '''
            }
        }

        stage('4. Packaging Container') {
            steps {
                echo "Tutti i test e le build sono superati con successo!"
                echo "L'applicazione è pronta per il rilascio continuo (CD)."
            }
        }
    }

    post {
        success {
            echo "SUCCESS: Pipeline completata con esito positivo! Semaforo VERDE."
        }
        failure {
            echo "ERROR: Qualcosa è fallito nella pipeline. Rilascio bloccato!"
        }
    }
}
