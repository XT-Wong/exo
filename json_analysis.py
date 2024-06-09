import json

# 读取json文件
with open('exo_data_july_2021.json', 'r') as f:
    data = json.load(f)

# 创建一个空集合来存储属性
keys = set()

# 遍历json对象，将所有的键添加到集合中
def extract_keys(obj):
    if isinstance(obj, dict):
        for k, v in obj.items():
            keys.add(k)
            if isinstance(v, (dict, list)):
                extract_keys(v)
                
    elif isinstance(obj, list):
        for item in obj:
            extract_keys(item)

extract_keys(data[0])
print(len(keys))
# 将集合中的每个元素写入txt文件
with open('keys.txt', 'w') as f:
    for item in keys:
        f.write("%s\n" % item)