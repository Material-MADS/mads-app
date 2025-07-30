#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
#          Last Update: Q3 2023
# ________________________________________________________________________________________________
# Authors: Shotaro Okamoto [2025]
# ________________________________________________________________________________________________
# Description: Serverside (Django) rest api utils for the 'Analysis' page involving
#              'Ase' components
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
from io import BytesIO
from ase.geometry import cellpar_to_cell

#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def save_binary_to_file(binary_data):
    # 一時ファイルを作成
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        # バイナリデータをファイルに書き込む
        temp_file.write(binary_data)
        temp_filename = temp_file.name  # 一時ファイルのパスを取得
    return temp_filename



def read_traj_with_ase(binary_data):
    traj_file_path = save_binary_to_file(binary_data)

    from ase.io import read
    atoms = read(traj_file_path) 

    return atoms



def get_ase(data):

    #energy = atoms.get_potential_energy()
    something = data['view']['settings']['options']['something']
    print(something)
    result = {}

    if(something == "Create"):
        pbc = data['view']['settings']['options']['pbc']
        if(pbc):
            cellpar = data['view']['settings']['options']['cell']
            cell = cellpar_to_cell([float(cellpar['a']),float(cellpar['b']),float(cellpar['c']),float(cellpar['alpha']),float(cellpar['beta']),float(cellpar['gamma'])])
            result["cell"] = cell
        else:
            result["cell"] = Cell([[0, 0, 0], [0, 0, 0], [0, 0, 0]])
        result["symbols"] = []
        result["positions"] = []
        result["pbc"] = pbc
    elif(something == "Edit your files"):
        base64_data = data['view']['settings']['options']['diff']['buffer']
        binary_data = base64.b64decode(base64_data)
        atoms = read_traj_with_ase(binary_data)
        result["cell"] = atoms.get_cell()
        result["symbols"] = atoms.get_chemical_symbols()
        result["positions"] = atoms.get_positions().tolist()
        result["pbc"] = atoms.pbc
    elif(something == "Download"):
        #atoms = build_atoms_from_data()
        celldata = data['view']['settings']['options']['cell']
        atomsdata = data['view']['settings']['options']['atoms']
        positions = data['view']['settings']['options']['positions']
        pbc = data['view']['settings']['options']['pbc']
        print(pbc)
        cell = Cell(celldata)
        atoms_list = [Atom(symbol=symbol,position=pos) for symbol,pos in zip(atomsdata, positions)]
        atoms = Atoms(atoms_list,cell = cell,pbc=pbc)
        buffer = BytesIO()
        write(buffer, atoms, format = 'traj')
        traj_data = buffer.getvalue()
        encoded = base64.b64encode(traj_data).decode('ascii')
        result['traj'] = encoded
        result['cell'] = celldata
        result['symbols'] = atoms.get_chemical_symbols()
        result['positions'] = atoms.get_positions().tolist()
        result['pbc']  = pbc
    else:
        result["content"] = "No"

    return result
#-------------------------------------------------------------------------------------------------

# If Custom Error Message is needed use the following:
# result['status'] = 'error'
# result['detail'] = "This is the Custom Error Message"
