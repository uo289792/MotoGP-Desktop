#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import xml.etree.ElementTree as ET

# Namespace del esquema (ajústalo si tu XML usa otro prefijo/URI)
NS = {"u": "http://www.uniovi.es"}

class Html:
    def __init__(self, title="Info del circuito", css_href="estilo.css", lang="es"):
        self.title = title
        self.css_href = css_href
        self.lang = lang
        self.parts = []

    def head(self):
        return f"""<!DOCTYPE html>
<html lang="{self.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{self.title}</title>
  <link rel="stylesheet" href="{self.css_href}">
</head>
"""

    def open_body(self):
        # Landmark ARIA y estructura semántica para accesibilidad
        return """<body>
  <header role="banner">
    <h1>Información del circuito</h1>
  </header>
  <main role="main">
"""

    def close_body(self):
        return """  </main>
  <footer role="contentinfo">
    <p>Generado automáticamente desde circuitoEsquema.xml</p>
  </footer>
</body>
</html>
"""

    def section(self, title, inner):
        return f"""    <section aria-labelledby="{self._slug(title)}">
      <h2 id="{self._slug(title)}">{title}</h2>
{inner}
    </section>
"""

    def dl(self, items):
        # items: lista de (dt, dd)
        out = ["      <dl>"]
        for dt, dd in items:
            out.append(f"        <dt>{self._escape(dt)}</dt>")
            out.append(f"        <dd>{dd}</dd>")
        out.append("      </dl>")
        return "\n".join(out) + "\n"

    def table(self, headers, rows):
        # Tabla accesible y adaptable
        out = ['      <div class="table-responsive">']
        out.append('      <table role="table">')
        out.append('        <thead>')
        out.append('          <tr>')
        for h in headers:
            out.append(f'            <th scope="col">{self._escape(h)}</th>')
        out.append('          </tr>')
        out.append('        </thead>')
        out.append('        <tbody>')
        for r in rows:
            out.append('          <tr>')
            for cell in r:
                out.append(f'            <td>{cell}</td>')
            out.append('          </tr>')
        out.append('        </tbody>')
        out.append('      </table>')
        out.append('      </div>')
        return "\n".join(out) + "\n"

    def add(self, html_fragment):
        self.parts.append(html_fragment)

    def to_string(self):
        return self.head() + self.open_body() + "".join(self.parts) + self.close_body()

    def _slug(self, s):
        return "".join(ch.lower() if ch.isalnum() else "-" for ch in s).strip("-")

    def _escape(self, s):
        return (
            s.replace("&", "&amp;")
             .replace("<", "&lt;")
             .replace(">", "&gt;")
             .replace('"', "&quot;")
             .replace("'", "&#39;")
        )

def read_dom(path):
    return ET.parse(path).getroot()

def text_of(el):
    # Texto plano del elemento (concatena si hay hijos textuales)
    if el is None:
        return ""
    txt = (el.text or "").strip()
    return txt

def serialize_attributes(el):
    # Convierte atributos a texto "a=b; c=d"
    if not el.attrib:
        return ""
    return "; ".join(f'{k}={v}' for k, v in el.attrib.items())

def element_to_html_value(el):
    # Representa un elemento u:nodo como HTML: texto + atributos + hijos simples
    val_parts = []
    # Texto principal
    t = text_of(el)
    if t:
        val_parts.append(escape_html(t))
    # Atributos
    attrs = serialize_attributes(el)
    if attrs:
        val_parts.append(f'<span class="attrs">{escape_html(attrs)}</span>')
    # Hijos simples de primer nivel (solo texto)
    child_texts = []
    for child in list(el):
        ctext = text_of(child)
        if ctext:
            child_texts.append(f'<span class="child"><strong>{escape_html(local_name(child))}:</strong> {escape_html(ctext)}</span>')
        # Si el hijo tiene atributos, los mostramos
        if child.attrib:
            child_texts.append(f'<span class="child-attrs">{escape_html(local_name(child))} attrs: {escape_html(serialize_attributes(child))}</span>')
    if child_texts:
        val_parts.append(" ".join(child_texts))
    return " ".join(val_parts) if val_parts else "&mdash;"

def escape_html(s):
    return (
        s.replace("&", "&amp;")
         .replace("<", "&lt;")
         .replace(">", "&gt;")
         .replace('"', "&quot;")
         .replace("'", "&#39;")
    )

def local_name(el):
    # Extrae el nombre local sin namespace
    if el.tag.rfind("}") != -1:
        return el.tag.split("}", 1)[1]
    return el.tag

def build_info_sections(root):
    html = Html(title="InfoCircuito", css_href="estilo.css", lang="es")

    # 1) Metadatos del circuito (todos los elementos del root que NO sean origen ni tramos)
    # Selección con XPath
    # Nota: ajusta estas rutas a tu esquema si necesitas campos específicos.
    items = []
    for el in root.findall("./*", NS):  # hijos directos
        lname = local_name(el)
        if lname in ("origen", "tramos"):
            continue  # excluir origen y tramos
        # Valor del elemento
        val_html = element_to_html_value(el)
        items.append((lname.capitalize(), val_html))

    if items:
        html.add(html.section("Datos generales del circuito", html.dl(items)))
    else:
        html.add(html.section("Datos generales del circuito", '      <p>No hay datos generales disponibles.</p>\n'))

    # 2) Si existen "sectores" como contenedor, presentar en tabla (opcional genérico)
    # Ejemplo: <sectores><sector id="1" nombre="...">...</sector></sectores>
    sectores = root.findall(".//u:sectores/u:sector", NS)
    if sectores:
        headers = ["ID", "Nombre", "Atributos", "Descripción"]
        rows = []
        for s in sectores:
            sid = s.attrib.get("id", "")
            nombre = s.attrib.get("nombre", "")
            attrs = serialize_attributes(s)
            desc_el = s.find("./u:descripcion", NS)
            desc = text_of(desc_el)
            rows.append([
                escape_html(sid),
                escape_html(nombre),
                escape_html(attrs),
                escape_html(desc or "")
            ])
        html.add(html.section("Sectores", html.table(headers, rows)))

    # 3) Cualquier otro contenedor relevante (genérico): listas de nodos con texto
    # Ejemplo: organización, ubicación, fechas, normativa, etc.
    # Capturamos todos los elementos que tengan hijos texto directo
    otros_items = []
    for el in root.findall(".//*", NS):
        lname = local_name(el)
        if lname in ("origen", "tramo", "tramos", "punto"):  # excluir detalle del recorrido
            continue
        # Si es hoja con texto y no está ya en datos generales (hijo directo de root)
        if len(list(el)) == 0 and text_of(el):
            # Construimos ruta breve padre/hijo
            parent = el.getparent() if hasattr(el, "getparent") else None  # ElementTree estándar no tiene getparent
            label = lname.capitalize()
            otros_items.append((label, escape_html(text_of(el))))
    # Evitar duplicados simples y no saturar
    if otros_items:
        # Podrías agrupar por secciones si conoces el esquema
        pass

    return html

def xml2html(xml_path: str, html_path: str):
    root = read_dom(xml_path)
    html = build_info_sections(root)

    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html.to_string())

if __name__ == "__main__":
    xml2html("circuitoEsquema.xml", "InfoCircuito.html")
    print("Generado InfoCircuito.html")
