# Exports waves.js file for Mozilla VR's A-Blast demo
# - Each blender layer is a wave
# - Sequences go in groups, alphabetical order
# - Enemies are drawn with Bezier Curves:
#     + material name defines movement (single, pingpong, loop)
#     + custom property "type" defines enemy name

import bpy


def getOrderedListOfGroupsInLayer(layer):
	curves = [ob for ob in bpy.data.objects if ob.layers[layer] and ob.type=='CURVE']
	groupset= set()
	for curve in curves:
		for group in curve.users_group:
			groupset.add(group.name)
	return sorted(list(groupset), key=int)

def getCustomData(obj, dataname):
	if not dataname in obj.data: return ''
	data = obj.data[dataname]
	if data:
		return '            '+dataname+': '+str(data)+',\n'
	return ''

out = 'var WAVES = [\n'
waves = []
exportwaves = [0,1,2,3,4,5,6,7,8,9]
debugmsg = ''
for l in exportwaves:
	wave = '  {\n'
	wave += '    name: "WAVE '+str(l+1)+'",\n'
	wave += '    sequences: [\n';
	groups = getOrderedListOfGroupsInLayer(l)
	if not groups: continue
	sequences = []
	for group in groups:
		enemies = []
		curves = sorted([ob.name for ob in bpy.data.groups[group].objects])
		if not curves: continue
		seq = ''
		seq += '      {\n        start: 0,\n        random: 0,\n';
		seq += '        subwave: "'+group+'",\n';
		seq += '        enemies:[\n'
		for i in curves:
			curve = bpy.data.objects[i]
			points = []
			for p in curve.data.splines[0].bezier_points:
				points.append('[{0:.3f},{1:.3f},{2:.3f}]'.format( -p.co.x, p.co.z, p.co.y ))

			enemyTimeOffset = getCustomData(curve, 'enemyTimeOffset')
			loopStart = getCustomData(curve, 'loopStart')
			type = curve.data['type']
			if type.find(',') >= 0:
				if enemyTimeOffset == '': debugmsg += '// enemyTimeOffset not set in group ' + group + ', curve ' + curve.name + '\n'
				type = '["'+'","'.join(type.split(',')) + '"]'
			else:
				type = '"' + type + '"'
			enemies.append(
				'          {\n'
				'            type: '+type+',\n'+
				'            points: ['+','.join(points)+'],\n'+
				'            movement: "'+curve.material_slots[0].material.name.lower()+'",\n'+
				enemyTimeOffset+
				loopStart+
				'            random: '+str(0)+',\n'+
				'          }')
		seq += ',\n'.join(enemies)
		seq += '\n        ]\n      }'
		sequences.append(seq)
	wave += ',\n'.join(sequences)
	wave += '\n    ]\n  }'
	waves.append(wave)
out += ',\n'.join(waves)
out += '\n];'

f = open(bpy.path.abspath("//")+'../../data/waves.js', 'w+')
f.write(debugmsg + '\n')
f.write(out)
f.close()
print(out)