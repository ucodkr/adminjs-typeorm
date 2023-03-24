#!/bin/bash
TAG=v4.0.0-ucod-2
git checkout npm-deploy
git merge ucodkr
yarn npm-release
git add lib -f
git commit -m "${TAG}"
git push origin npm-deploy

git tag -d ${TAG}
git push --delete origin ${TAG}
git tag ${TAG}
git push origin ${TAG}

git checkout ucodkr
