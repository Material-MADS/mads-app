#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2025
# ________________________________________________________________________________________________
# Authors: Shotaro Okamoto [2025]
# ________________________________________________________________________________________________
# Description: Serverside (Django) rest api utils for the 'Analysis' page involving
#              'Atomic Simulation Environment' components
# ------------------------------------------------------------------------------------------------
# Notes:  This is one of the REST API parts of the 'analysis' interface of the website that
#         allows serverside work for the 'Ase' component.
# ------------------------------------------------------------------------------------------------
# References: logging, numpy, tempfile, os, base64, io, ase, asel ibs
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
import logging
import numpy as np
import tempfile
import os
from ase.io import read ,write
import base64
from ase import Atoms 
from ase.cell import Cell
from ase.atom import Atom
from ase.visualize import view
from io import BytesIO, StringIO
from ase.geometry import cellpar_to_cell

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def save_binary_to_file(binary_data):
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        temp_file.write(binary_data)
        temp_filename = temp_file.name
    return temp_filename



def read_traj_with_ase(binary_data,fmt):
    traj_file_path = save_binary_to_file(binary_data)
    if(fmt == "txt"):
        atoms = read(traj_file_path)
    else:
        atoms = read(traj_file_path, format = fmt) 
    return atoms



def get_ase(data):

    something = data['view']['settings']['options']['something']
    result = {}

    if(something == "Upload"):
        base64_data = data['view']['settings']['options']['upload']['buffer']
        filename = data['view']['settings']['options']['upload']['name']
        fmt = os.path.splitext(filename)[1].lstrip(".")
        if fmt =="xyz":
            fmt = "extxyz"
        binary_data = base64.b64decode(base64_data)
        atoms = read_traj_with_ase(binary_data,fmt)
        result["cell"] = atoms.get_cell()
        result["numbers"] = atoms.get_atomic_numbers()
        result["positions"] = atoms.get_positions().tolist()
        result["pbc"] = atoms.pbc
        result["cellpar"] = atoms.get_cell_lengths_and_angles()
        result["uploaded"] = True
    elif(something == "Download"):
        download_data = data['view']['settings']['options']['download']
        celldata = download_data['cell']
        atomsdata = download_data['atoms']
        positions = download_data['positions']
        pbc = download_data['pbc']
        format = download_data['format']
        cell = Cell(celldata)
        atoms_list = [Atom(symbol=Z,position=pos) for Z,pos in zip(atomsdata, positions)]
        atoms = Atoms(atoms_list,cell = cell,pbc=pbc)
        if(format in [ "traj","png","cif"]):
            buffer = BytesIO()
            write(buffer, atoms, format = format)
            file_data = buffer.getvalue()
        else:
            buffer = StringIO()
            if(format == "txt"):
                format = "xyz"
            write(buffer, atoms, format = format)
            file_data = buffer.getvalue().encode("utf-8") 
        encoded = base64.b64encode(file_data).decode('ascii')
        result['file'] = encoded
    else:
        result["content"] = "No"

    return result
#-------------------------------------------------------------------------------------------------

# If Custom Error Message is needed use the following:
# result['status'] = 'error'
# result['detail'] = "This is the Custom Error Message"
