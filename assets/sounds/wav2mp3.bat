X:\Programas\advanced_renamer_portable\arenc -e X:\Programas\advanced_renamer_portable\BatchMethods\ashooterwavs.aren -p . -msk *.wav
for %%f in (*.wav) do (
	X:\Programas\sox\sox %%f aa.wav reverse silence 1 0.1 0.05% fade t 0.2 reverse 
	del %%f
	ren aa.wav %%f )
for %%f in (*.wav) do oggenc2 -q 10 %%f
del *.wav
