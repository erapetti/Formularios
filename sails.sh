#!/bin/bash
#
#


cd /home/erapetti/Formularios
export NODE_ENV=production
exec sails lift --prod $1
