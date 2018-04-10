#!/bin/bash

eval "$(ssh-agent -s)" # Start ssh-agent cache
chmod 600 .travis/id_rsa # Allow read access to the private key
ssh-add .travis/id_rsa # Add the private key to SSH

git config --global push.default matching
git remote add deploy ssh://git@$IP:$PORT$TEMP_DEPLOY_DIR
git push deploy production

# Skip this command if you don't need to execute any additional commands after deploying.
ssh deploy@$IP -p $PORT <<EOF
  cd $TEMP_DEPLOY_DIR
  cp * $DEPLOY_DIR
  cd $DEPLOY_DIR # Change to whatever commands you need!
  npm install
  rm -rf dist/*
  npm run build
EOF