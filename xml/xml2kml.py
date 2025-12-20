#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import xml.etree.ElementTree as ET

NS = {"u": "http://www.uniovi.es"}  # namespace del esquema

KML_HEADER = """<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
  <name>Circuito</name>
"""

KML_FOOTER = """</Document>
</kml>
"""

def read_dom(xml_path: str) -> ET.ElementTree:
    return ET.parse(xml_path)

def get_origen(root):
    lon = root.find(".//u:origen/u:longitud", NS).text
    lat = root.find(".//u:origen/u:latitud", NS).text
    alt = root.find(".//u:origen/u:altitud", NS).text
    return lon, lat, alt

def get_tramos(root):
    tramos = []
    for tramo in root.findall(".//u:tramos/u:tramo", NS):
        tid = tramo.attrib.get("id")
        punto = tramo.find("./u:punto", NS)
        lon = punto.find("./u:longitud", NS).text
        lat = punto.find("./u:latitud", NS).text
        alt = punto.find("./u:altitud", NS).text
        tramos.append((tid, lon, lat, alt))
    return tramos

def placemark(name: str, lon: str, lat: str, alt: str) -> str:
    return f"""  <Placemark>
    <name>{name}</name>
    <Point>
      <coordinates>{lon},{lat},{alt}</coordinates>
    </Point>
  </Placemark>
"""

def recorrido_linea(origen, tramos):
    coords = [f"{origen[0]},{origen[1]},{origen[2]}"]
    for _, lon, lat, alt in tramos:
        coords.append(f"{lon},{lat},{alt}")
    return f"""  <Placemark>
    <name>Recorrido completo</name>
    <LineString>
      <coordinates>
        {' '.join(coords)}
      </coordinates>
    </LineString>
  </Placemark>
"""

def xml2kml(xml_path: str, kml_path: str):
    tree = read_dom(xml_path)
    root = tree.getroot()

    origen = get_origen(root)
    tramos = get_tramos(root)

    out = []
    out.append(KML_HEADER)
    out.append(placemark("Origen", *origen))

    for tid, lon, lat, alt in tramos:
        out.append(placemark(tid, lon, lat, alt))

    # Añadimos la línea que conecta todos los puntos
    out.append(recorrido_linea(origen, tramos))

    out.append(KML_FOOTER)

    with open(kml_path, "w", encoding="utf-8") as f:
        f.write("".join(out))

if __name__ == "__main__":
    xml2kml("circuitoEsquema.xml", "circuito.kml")
    print("Generado circuito.kml")