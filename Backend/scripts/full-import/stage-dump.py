import sys,re
source=sys.argv[1]
sys.stdout.write('SET NAMES utf8mb4; SET FOREIGN_KEY_CHECKS=0;\n')
creating=False
with open(source,encoding='utf-8') as f:
 for line in f:
  if line.startswith('CREATE TABLE `'):
   if not re.match(r'^CREATE TABLE `[A-Za-z0-9_]+` \($',line.rstrip()):
    raise ValueError('Unexpected table definition')
   creating=True
   sys.stdout.write(line)
  elif creating:
   sys.stdout.write(line)
   if line.rstrip().endswith(';'):creating=False
  elif line.startswith('INSERT INTO `'):
   if not re.match(r'^INSERT INTO `[A-Za-z0-9_]+` VALUES ',line):
    raise ValueError('Unexpected insert format')
   sys.stdout.write(line)
sys.stdout.write('SET FOREIGN_KEY_CHECKS=1;\n')
