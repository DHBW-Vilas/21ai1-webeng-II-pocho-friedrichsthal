#!/bin/bash

echo "Installing PHPMyAdmin"

sudo chown -R gitpod:gitpod /var/www
cd /var/www
git clone --depth 1 --branch $PMA_VERSION https://github.com/phpmyadmin/phpmyadmin.git
cd phpmyadmin
composer update --no-dev
yarn install --production
cp config.sample.inc.php config.inc.php
sed -i "s/cfg\['blowfish_secret'\] = '';/cfg\['blowfish_secret'\] = '$(cat /dev/urandom | tr -dc \"[:alnum:]\" | fold -w ${1:-32} | head -n 1)';/g" config.inc.php
sed -i "s/\['AllowNoPassword'\] = false;/\['AllowNoPassword'\] = true;/g" config.inc.php
mkdir tmp
echo "\$cfg['TempDir'] = '/var/www/phpmyadmin/tmp';" >> config.inc.php

echo "Done"
source ~/.bashrc
