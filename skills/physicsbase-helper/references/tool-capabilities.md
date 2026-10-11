# 工具能力与权限

本插件只有 Skills、文档和测试，未内置计算服务器、数据库镜像、GPU 后端或定时任务。先检查宿主实际提供的文件、命令、Python/Julia/C++/MATLAB、符号库、绘图、联网和连接器；只调用已授权能力。

| 任务 | 候选工具 | 必须核实 |
| --- | --- | --- |
| 符号与张量 | SymPy、SageMath、Mathematica、EinsteinPy、xAct | 库及版本、符号约定、表达式与人工结果 |
| 数值和高性能 | NumPy、SciPy、Julia、C++、PETSc、JAX、PyTorch、CUDA | 环境、算法、收敛、精度、设备是否真被使用 |
| 量子与天文 | QuTiP、Astropy、官方数据接口 | 依赖可用性、模型、数据版本及单位 |
| 图像与动画 | Matplotlib、Plotly、PyVista、Three.js、Manim、Blender | 文件实际生成、可打开、模型与图例一致 |
| 文献与复现 | 授权搜索、arXiv、INSPIRE、NASA ADS、NIST、GWOSC、Git、LaTeX | 原文可访问、准确引用、实际构建 |

优先复用实际已有 Windows、WSL、Conda、Python 或 GPU 环境。需要安装依赖、改变环境、连接外部服务时遵守宿主权限与用户授权。缺工具时交付可执行方案和复现命令，标明未运行；不能假装已经执行。
