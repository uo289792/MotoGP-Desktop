#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import xml.etree.ElementTree as ET

NS = {"u": "http://www.uniovi.es"}

LABELS = {
    "longitudCircuito": "Longitud del circuito",
    "anchura": "Anchura",
    "localidad": "Localidad",
    "pais": "País",
    "patrocinador": "Patrocinador",
    "fecha": "Fecha",
    "hora": "Hora",
    "numVueltas": "Número de vueltas",
    "nombre": "Nombre"
}


class Html:
    def __init__(self, title="MotoGP-Información", css_href="../estilo/estilo.css", lang="es"):
        self.title = title
        self.css_href = css_href
        self.lang = lang
        self.parts = []

    def head(self):
        return f"""<!DOCTYPE HTML>
<html lang="{self.lang}">
<head>
    <meta charset="UTF-8" />
    <meta name="author" content="David Muños Río" />
    <meta name="description" content="Información xml del proyecto MotoGP-Desktop" />
    <meta name="keywords" content="MotoGP, MotoGP-Desktop, xml" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{self.title}</title>
    <link rel="stylesheet" href="{self.css_href}" />
    <link rel="icon" href="../multimedia/favicon.ico" type="image/x-icon" />
</head>
"""

    def open_body(self):
        return (
            "<body>\n"
            "  <header>\n"
            "    <h1>MotoGP – Información del circuito</h1>\n"
            "  </header>\n"
            "  <main>\n"
        )

    def close_body(self):
        return "  </main>\n</body>\n</html>\n"

    def section(self, title, inner):
        return f"""    <section>
      <h3>{title}</h3>
{inner}    </section>
"""

    def ul(self, items):
        out = ["      <ul>"]
        for item in items:
            out.append(f"        <li>{item}</li>")
        out.append("      </ul>")
        return "\n".join(out) + "\n"

    def add(self, html_fragment):
        self.parts.append(html_fragment)

    def to_string(self):
        return self.head() + self.open_body() + "".join(self.parts) + self.close_body()


def text_of(el):
    return (el.text or "").strip() if el is not None else ""


def read_dom(path):
    return ET.parse(path).getroot()


def format_with_unit(el):
    val = text_of(el)
    unidad = el.attrib.get("unidad")
    zona = el.attrib.get("zona")
    if unidad:
        return f"{val} {unidad}"
    if zona:
        return f"{val} {zona}"
    return val


def build_info_sections(root):
    html = Html()

    # --- Datos generales ---
    general_items = []

    nombre = root.find("./u:nombre", NS)
    if nombre is not None:
        general_items.append(f"{LABELS['nombre']}: {text_of(nombre)}")

    caracteristicas = root.find("./u:caracteristicas", NS)
    if caracteristicas is not None:
        for child in caracteristicas.findall("./*", NS):
            lname = child.tag.split("}", 1)[-1]
            label = LABELS.get(lname, lname.capitalize())
            general_items.append(f"{label}: {format_with_unit(child)}")

    carrera = root.find("./u:carrera", NS)
    if carrera is not None:
        for child in carrera.findall("./*", NS):
            lname = child.tag.split("}", 1)[-1]
            label = LABELS.get(lname, lname.capitalize())
            general_items.append(f"{label}: {format_with_unit(child)}")

    # --- Fotos y Videos dentro de la primera sección ---
    figuras = []

    # Fotos
    fotos = root.findall(".//u:fotos/u:foto", NS)
    for f in fotos:
        src = "../" + f.attrib.get("src", "")
        desc = f.attrib.get("descripcion", "")
        figuras.append(f"""      <figure>
        <img src="{src}" alt="{desc}" />
        <figcaption>{desc}</figcaption>
      </figure>
""")

    # Videos
    videos = root.findall(".//u:videos/u:video", NS)
    for v in videos:
        src = "../" + v.attrib.get("src", "")
        desc = v.attrib.get("descripcion", "")
        figuras.append(f"""      <figure>
        <video src="{src}" controls></video>
        <figcaption>{desc}</figcaption>
      </figure>
""")

    # Combinar UL de datos generales + figuras
    contenido_seccion = html.ul(general_items) + "".join(figuras)
    html.add(html.section("Datos generales del circuito", contenido_seccion))

    # --- Resultados ---
    vencedor = root.find(".//u:vencedor", NS)
    if vencedor is not None:
        v_items = []
        for c in vencedor:
            lname = c.tag.split("}", 1)[-1]
            label = LABELS.get(lname, lname.capitalize())
            val = text_of(c)
            if lname == "tiempo":
                val = f"{val} segundos"
            v_items.append(f"{label}: {val}")
        html.add(html.section("Vencedor tras la carrera", html.ul(v_items)))

    podium = root.findall(".//u:podium/u:puesto", NS)
    if podium:
        podium_items = []
        for p in podium:
            piloto = text_of(p.find("u:piloto", NS))
            pos = p.attrib.get("posicion")
            pais = p.attrib.get("pais")
            puntos = p.attrib.get("puntos")
            podium_items.append(
                f"Posición {pos}:"
                f"<ul>"
                f"<li>Piloto: {piloto}</li>"
                f"<li>País: {pais}</li>"
                f"<li>Puntos: {puntos}</li>"
                f"</ul>"
            )
        html.add(html.section("Podium tras la carrera", html.ul(podium_items)))

    # --- Referencias ---
    referencias = root.findall(".//u:referencia", NS)
    if referencias:
        ref_items = [
            f'<a href="{text_of(r)}">{r.attrib.get("sitio", "")}</a>'
            for r in referencias
        ]
        html.add(html.section("Referencias", html.ul(ref_items)))

    return html


def xml2html(xml_path: str, html_path: str):
    root = read_dom(xml_path)
    html = build_info_sections(root)
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html.to_string())


if __name__ == "__main__":
    xml2html("circuitoEsquema.xml", "InfoCircuito.html")
    print("Generado InfoCircuito.html")
