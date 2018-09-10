#Creates a directory for a project that you can easily add to a website
import sys, os

def gen_boilerplate_html(title, jsfile):
    html = """<!doctype html>

<head>
    <title>{title}</title>
    <meta charset="UTF-8">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
</head>

<body>
    <div id="canvas-wrapper">
        <canvas id="canvas-1" width="600" height="400"></canvas>
    </div>
    <script src="engine.js"></script>
    <script src="{jsfile}"></script>
</body>

</html>
""".format(title=title, jsfile=jsfile)
    return html

def make_project(title):
    if os.path.isdir(title):
        print("Folder already exists")
        return
    os.mkdir(title)
    jsfile = title.replace(" ", "-") + ".js"
    with open(os.path.join(title, "index.html"), "w") as f:
        f.write(gen_boilerplate_html(title, jsfile))
    with open("engine.js", "r") as o:
        with open(os.path.join(title, "engine.js"), "w") as f:
            f.write(o.read())
    with open(os.path.join(title, jsfile), "w") as f:
        f.write("""//EMPTY JS
    
        
""")

if __name__ == "__main__":
    make_project(sys.argv[1])