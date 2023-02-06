var attributes = ["aVertexPosition", "aVertexColor", "aVertexSelectionColor", "aVertexNormal", "aTextureCoordinate"];
var uniforms = ["uModelViewMatrix", "uProjectionMatrix", "uOrthographicMatrix", "uObjectMatrix", "uRotationMatrix", "uNormalMatrix", "uPointSize", "uNearFar", "uPositionType", "uTexture", "uTextureType"];
var vertexShaderSource = "\n  attribute vec3 aVertexPosition;\n  attribute vec4 aVertexColor;\n  attribute vec4 aVertexSelectionColor;\n  attribute vec3 aVertexNormal;\n  attribute vec2 aTextureCoordinate;\n  \n  uniform mat4 uModelViewMatrix;\n  uniform mat4 uProjectionMatrix;\n  uniform mat4 uOrthographicMatrix;\n  uniform mat4 uObjectMatrix;\n  uniform mat4 uRotationMatrix;\n  uniform mat4 uNormalMatrix;\n  uniform float uPointSize;\n  uniform vec2 uNearFar;\n  uniform int uPositionType; // 1: plane, 2: depth, basic\n\n  varying vec4 vColor;\n  varying vec4 vSelectionColor;\n  varying vec3 vTransformedNormal;\n  varying vec2 vTextureCoordinate;\n  varying float vDepth;\n\n  vec4 getOrthoPosition() {\n    vec4 transformedPosition = uObjectMatrix * vec4(aVertexPosition, 1.0);\n    vec4 orthoPosition = uModelViewMatrix * vec4(transformedPosition.xyz, 1.0);\n    return orthoPosition;\n  }\n  vec3 getRotatedNormal() {\n    vec3 rotatedModelNormal = (uRotationMatrix * vec4(aVertexNormal, 1.0)).xyz;\n    vec3 rotatedNormal = normalize(uNormalMatrix * vec4(rotatedModelNormal, 1.0)).xyz;\n    return rotatedNormal;\n  }\n  float calcDepth(float zValue) {\n    return -(zValue / uNearFar.y);\n  }\n\n  void main(void) {\n    vColor = aVertexColor;\n    vSelectionColor = aVertexSelectionColor;\n    gl_PointSize = uPointSize;\n\n    vec4 orthoPosition = getOrthoPosition();\n    vTransformedNormal = getRotatedNormal();\n\n    vDepth = calcDepth(orthoPosition.z);\n    gl_Position = uProjectionMatrix * orthoPosition;\n    \n    vTextureCoordinate = aTextureCoordinate;\n  }\n";
var fragmentShaderSource = "\n  precision highp float;\n\n  varying vec4 vColor;\n  varying vec4 vSelectionColor;\n  varying vec2 vTextureCoordinate;\n  varying vec3 vTransformedNormal;\n  varying float vDepth;\n\n  uniform sampler2D uTexture;\n  uniform int uTextureType; // default : color, 1 : texture, 2 : reverseY, 3 : depth\n  \n  vec3 encodeNormal(in vec3 normal) {\n    return normal.xyz * 0.5 + 0.5;\n  }\n  vec3 decodeNormal(in vec3 normal){\n    return normal * 2.0 - 1.0;\n  }\n  vec4 packDepth(float depth) {\n    vec4 enc = vec4(1.0, 255.0, 65025.0, 16581375.0) * depth;\n    enc = fract(enc);\n    enc -= enc.yzww * vec4(1.0/255.0, 1.0/255.0, 1.0/255.0, 0.0);\n    return enc;\n  }\n\n  void main(void) {\n    if (uTextureType == 1) {\n      //gl_FragColor = vec4(vColor.xyz, vColor.a);\n      gl_FragColor = texture2D(uTexture, vec2(vTextureCoordinate.x, 1.0 - vTextureCoordinate.y));\n    } else if (uTextureType == 2) {\n      gl_FragColor = vec4(vSelectionColor.xyz, vSelectionColor.a);\n    } else if (uTextureType == 3) {\n      gl_FragColor = packDepth(vDepth);\n    } else if (uTextureType == 4) {\n      gl_FragColor = vec4(encodeNormal(vTransformedNormal), 1.0);\n    } else if (uTextureType == 5) {\n      gl_FragColor = vec4(vColor.xyz, vColor.a);\n    }  else {\n      gl_FragColor = vec4(vColor.xyz, vColor.a);\n    }\n  }\n";
export var DefaultShader = {
    attributes: attributes,
    uniforms: uniforms,
    vertexShaderSource: vertexShaderSource,
    fragmentShaderSource: fragmentShaderSource,
};
