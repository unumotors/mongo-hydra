allow_k8s_contexts(['docker-for-desktop', 'docker-desktop'])

docker_build(
    'mongo-hydra:development', 
    './', 
    dockerfile='./development.Dockerfile',
    live_update=[
    # when package.json changes, we need to do a full build
    fall_back_on(['package.json', 'package-lock.json']),
    # Map the local source code into the container under
    sync('./src/', '/app/src/'),
    restart_container()
    ]
)

k8s_yaml(listdir('local/k8s'))
k8s_yaml(listdir('local/k8s/hydra'))
