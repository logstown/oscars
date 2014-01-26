import json

data = [ { 'a':'A', 'b':(2, 4), 'c':3.0 } ]
print 'DATA:', repr(data)

data_string = json.dumps(data)
print 'JSON:', data_string

# with open("noms.txt") as f:
#     content = f.readlines()

f = open("noms.txt")

nextiscat = False
awards = {}

for line in f:
	if nextiscat == True:
		award = line.rstrip('\n')
		awards[line.rstrip('\n')] = {'nominees':[], 'winner': 0};
		nextiscat = False 
	else:

		if line == '\n':
			nextiscat = True
		else:
			nom = line.rstrip('\n')
			nom = nom.split('-')
			awards[award]['nominees'].append({'movie': nom[0].strip(), 'team': nom[1].strip()})

print json.dumps(awards)