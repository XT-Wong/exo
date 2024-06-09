import csv
import json

# 打开CSV文件并读取数据
with open('keys.txt', 'r') as f:
    keys = set(line.strip() for line in f)
    
def non_comment_lines(f):
    for line in f:
        line = line.strip()
        if line and not line.startswith('#'):
            yield line
            
with open('data2024.csv', 'r') as f:
    reader = csv.DictReader(non_comment_lines(f))
    rows = list(reader)

for row in rows:
    for key in list(row.keys()):  # 使用list创建一个键的副本，以避免在迭代过程中修改字典
        if key not in keys:
            del row[key]


print(len(rows[0]))
with open('filtered_data2024.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=keys)
    writer.writeheader()
    writer.writerows(rows)