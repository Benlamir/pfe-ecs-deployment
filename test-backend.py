import boto3
import urllib.request
import urllib.error

try:
    session = boto3.Session(profile_name='sandbox-admin')
    cfn = session.client('cloudformation')
    
    print("Récupération de l'URL de l'ALB...")
    response = cfn.describe_stacks(StackName='pfe-alb-stack')
    alb_url = None
    for output in response['Stacks'][0]['Outputs']:
        if output['OutputKey'] == 'ALBDNSName':
            alb_url = output['OutputValue']
            
    print(f"🌐 ALB URL trouvé : http://{alb_url}")
    print("----------------------------------------")
    print("Tentative de ping du backend (/health/)...")
    
    req = urllib.request.Request(f"http://{alb_url}/health/")
    try:
        with urllib.request.urlopen(req) as res:
            print(f"✅ Statut Health Check : {res.getcode()}")
            print(f"✅ Réponse : {res.read().decode('utf-8')}")
    except urllib.error.HTTPError as e:
        print(f"❌ Échec HTTP : {e.code} - {e.reason}")
        print(f"Détails : {e.read().decode('utf-8')}")
    except urllib.error.URLError as e:
        print(f"❌ Échec de connexion : {e.reason}")
        
except Exception as e:
    print(f"Erreur d'exécution : {e}")
