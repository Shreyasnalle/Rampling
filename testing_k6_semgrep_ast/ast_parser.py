import ast 
def extracting_routes(filepath) :
    with open(filepath, "r") as f :
        source = f.read()
    tree = ast.parse(source)
    routes = []
    for node in ast.walk(tree) :
        if isinstance(node, ast.FunctionDef) :
            for decorator in node.decorator_list :
                if (isinstance(decorator, ast.Call) and isinstance(decorator.func, ast.Attribute) and isinstance(decorator.func.value, ast.Name) and decorator.func.value.id == "app") :
                    method = decorator.func.attr
                    if decorator.args :
                        path = decorator.args[0].value
                        routes.append({
                            "method" : method.upper(),
                            "path" : path,
                            "function" : node.name
                        })
    print(ast.dump(tree, indent = 2)) 
    return routes
if __name__ == "__main__" :
    import json 
    routes = extracting_routes("main.py")
    print(json.dumps(routes, indent = 2)) 