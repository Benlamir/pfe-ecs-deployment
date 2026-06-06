import boto3
from botocore.exceptions import ClientError


my_session = boto3.Session(profile_name = 'sandbox-admin')
cfn = my_session.client('cloudformation')

stacks = ['pfe-monitoring-stack', 'pfe-ecs-stack', 'pfe-rds-stack', 'pfe-alb-stack']

for s in stacks:
    try:
        print(f"tentative de suppression de {s}...")
        cfn.delete_stack(StackName=s)

        waiter = cfn.get_waiter('stack_delete_complete')
        waiter.wait(StackName=s)
        print(f"{s} détruite avec succés")


    except ClientError as error:
        if error.response ['Error']['Code'] == 'ValidationError':
            print(f"Ignoré: la stack {s} est déjà détruite ou n'existe pas. detail {error}")
        else:
            raise error