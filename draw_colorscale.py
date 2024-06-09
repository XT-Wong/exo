import matplotlib.pyplot as plt
import numpy as np

def interpolate_color(value, RGB1, RGB2):
    r1, g1, b1 = RGB1
    r2, g2, b2 = RGB2

    final_red = (r2 - r1) * value + r1
    final_green = (g2 - g1) * value + g1
    final_blue = (b2 - b1) * value + b1

    return final_red/255, final_green/255, final_blue/255

def astro_color_scale(temp):
    if temp < 3500:
        return interpolate_color(temp/3500, [128, 0, 0], [255, 0, 0])
    elif temp < 5000:
        return interpolate_color((temp-3500)/1500, [255, 0, 0], [255, 128, 0])
    elif temp < 6500:
        return interpolate_color((temp-5000)/1500, [255, 128, 0], [255, 255, 0])
    elif temp < 10000:
        return interpolate_color((temp-6500)/3500, [255, 255, 0], [255, 255, 224])
    elif temp < 20000:
        return interpolate_color((temp-10000)/10000, [255, 255, 224], [255, 255, 255])
    
    elif temp < 30000:
        return interpolate_color((temp-20000)/10000, [255, 255, 255], [128, 128, 255])
    else:
        return [128/255, 128/255, 255/255]

temps = np.linspace(0, 30000, 800)
colors = [astro_color_scale(temp) for temp in temps]

fig, ax = plt.subplots(figsize=(8, 2),
                        constrained_layout=False,
                        dpi=80)

colormap = plt.get_cmap('viridis')
plt.imshow([colors], aspect='auto', cmap=colormap, origin='lower')
plt.axis('off')

plt.savefig('colorbar.png')