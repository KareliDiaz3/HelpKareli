import requests
import os
from datetime import datetime
import time

# CONFIGURACIÓN ACTUALIZADA
USER = "sTr4yDev"           # 🔹 Tu nombre de usuario en GitHub
REPO = "speakLexi2.0"       # 🔹 Nombre exacto del repositorio
BRANCH = "main"             # 🔹 Rama principal (puede ser "main" o "master")
TOKEN = ""                  # 🔹 Opcional: Token de GitHub para más límites de API

# Configuración de URLs
API_URL = f"https://api.github.com/repos/{USER}/{REPO}/branches/{BRANCH}"
RAW_BASE = f"https://raw.githubusercontent.com/{USER}/{REPO}/{BRANCH}/"

def obtener_commit_mas_reciente():
    """Obtiene el commit más reciente para asegurar datos actualizados"""
    headers = {}
    if TOKEN:
        headers['Authorization'] = f'token {TOKEN}'
    
    print("🔄 Verificando commit más reciente...")
    response = requests.get(API_URL, headers=headers)
    
    if response.status_code == 404:
        raise Exception(f"❌ Error: Repositorio {USER}/{REPO} o rama '{BRANCH}' no encontrados")
    elif response.status_code == 403:
        print("⚠️  Límite de API excedido. Usando datos disponibles...")
        return None
    elif response.status_code != 200:
        raise Exception(f"❌ Error de API: {response.status_code} - {response.text}")
    
    branch_data = response.json()
    commit_sha = branch_data['commit']['sha']
    commit_date = branch_data['commit']['commit']['committer']['date']
    
    print(f"✅ Commit más reciente: {commit_sha[:8]}")
    print(f"📅 Fecha del commit: {commit_date}")
    
    return commit_sha

def generar_raw_links():
    """Genera enlaces raw actualizados con manejo de errores mejorado"""
    
    # Obtener commit actual
    commit_sha = obtener_commit_mas_reciente()
    
    # Usar commit específico para obtener estructura exacta
    if commit_sha:
        trees_url = f"https://api.github.com/repos/{USER}/{REPO}/git/trees/{commit_sha}?recursive=1"
        raw_base_actualizado = f"https://raw.githubusercontent.com/{USER}/{REPO}/{commit_sha}/"
    else:
        trees_url = f"https://api.github.com/repos/{USER}/{REPO}/git/trees/{BRANCH}?recursive=1"
        raw_base_actualizado = RAW_BASE

    headers = {}
    if TOKEN:
        headers['Authorization'] = f'token {TOKEN}'

    print("📡 Obteniendo estructura del repositorio...")
    
    try:
        response = requests.get(trees_url, headers=headers)
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"❌ Error al conectar con GitHub: {e}")

    if 'tree' not in data:
        raise Exception("❌ Estructura de datos inesperada en la respuesta de GitHub")

    # Filtrar solo archivos (no directorios)
    archivos = [item for item in data['tree'] if item['type'] == 'blob']
    
    if not archivos:
        print("⚠️  No se encontraron archivos en el repositorio")
        return

    # Generar archivo con timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    nombre_archivo = f"raw_links_{timestamp}.txt"
    ruta_salida = os.path.join(os.getcwd(), nombre_archivo)

    print(f"📝 Generando archivo: {nombre_archivo}")
    
    with open(ruta_salida, "w", encoding="utf-8") as f:
        f.write(f"# Enlaces RAW actualizados - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"# Repositorio: {USER}/{REPO}\n")
        f.write(f"# Commit: {commit_sha if commit_sha else 'Último disponible'}\n")
        f.write(f"# Total de archivos: {len(archivos)}\n\n")
        
        for archivo in archivos:
            raw_url = raw_base_actualizado + archivo['path']
            f.write(raw_url + "\n")

    print(f"✅ Archivo generado exitosamente: {ruta_salida}")
    print(f"📊 Estadísticas:")
    print(f"   • Total de archivos: {len(archivos)}")
    print(f"   • Tamaño del archivo: {os.path.getsize(ruta_salida)} bytes")
    print(f"   • Commit utilizado: {commit_sha[:8] if commit_sha else 'N/A'}")

    # Mostrar algunos ejemplos
    print(f"\n🔍 Primeros 5 enlaces generados:")
    for archivo in archivos[:5]:
        print(f"   • {raw_base_actualizado + archivo['path']}")

if __name__ == "__main__":
    try:
        inicio = time.time()
        generar_raw_links()
        fin = time.time()
        print(f"\n⏱️  Tiempo total: {fin - inicio:.2f} segundos")
    except Exception as e:
        print(f"\n💥 Error: {e}")
        print("🔧 Solución: Verifica la configuración (USER, REPO, BRANCH) y tu conexión a internet")