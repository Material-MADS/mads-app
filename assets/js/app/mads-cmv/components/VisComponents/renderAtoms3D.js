/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2025)
//          Last Update: Q4 2025
// ________________________________________________________________________________________________
// Authors: Shotaro Okamoto [2025]
// ________________________________________________________________________________________________
// Description: This module provides a 3D visualization tool using Three.js.  
//              It is designed to render atomic structures within the 'Atomic Simulation Environment' (ASE) component,  
//              reproducing the graphical interface of the Python ASE library in a web-based environment.
// ------------------------------------------------------------------------------------------------
// Notes: The code utilizes Three.js for interactive visualization of atomic models.  
//        - It is integrated into the ASE component, serving as a frontend counterpart to the Python ASE library.  
//        - The goal is to replicate key aspects of the ASE graphical user interface (GUI) for use in a browser-based application.
// ------------------------------------------------------------------------------------------------
// References: three
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The renderAtoms3D Code
//-------------------------------------------------------------------------------------------------

let cellMatrix, pbc, nonCell, line;


function renderAtoms3D(containerSelector, atomsData,onTextChange) {
  const container = document.querySelector(containerSelector);
  container.innerHTML = '';
  const width = container.clientWidth;
  const height = container.clientHeight;

  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ antialias: true , alpha: true });
  renderer.setSize(width, height);
  renderer.setClearColor(0xffffff); 
  renderer.autoClear = false;
  const canvas = renderer.domElement;
  canvas.setAttribute("tabindex","0");
  canvas.setAttribute("id",`${containerSelector}`)
  container.appendChild(canvas);


  // light
  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1).normalize();
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);

    // camera
    const aspect = width / height;
    const frustumSize = 15; 
    
    const camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,  // left
      frustumSize * aspect / 2,   // right
      frustumSize / 2,            // top
      frustumSize / -2,           // bottom
      0.1,                        // near
      1000                        // far
    );
  
    camera.position.set(100,100,100);
  
  
  
    // controls
    const controls = new OrbitControls(camera,canvas);
    controls.minPolarAngle = -Infinity;
    controls.maxPolarAngle = Infinity;
    controls.minAzimuthAngle = -Infinity;
    controls.maxAzimuthAngle = Infinity;
    controls.mouseButtons.LEFT = null;
    controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;



  // write atoms
  if(atomsData.cell){
    cellMatrix = atomsData.cell; 
    line = drawCellBox(scene, camera, controls);
    nonCell = false;
    atomsData.positions.forEach((pos, i) => {
      const number = atomsData.numbers[i];
      addAtoms(scene,number,pos)
    });
    pbc = atomsData.pbc;
  }else{
    cellMatrix = [[0.0,0.0,0.0],[0.0,0.0,0.0],[0.0,0.0,0.0]];
    line = drawCellBox(scene, camera, controls);
    pbc = [false,false,false]
    nonCell = true;
  }











  const axesScene = new THREE.Scene();
  const axesCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 10);
  axesCamera.up = camera.up;
  axesCamera.lookAt(axesScene.position);
  
  const axesHelper = new THREE.AxesHelper(1);
  axesScene.add(axesHelper);




  function animate() {
    renderer.clear();
    requestAnimationFrame(animate);
    
    renderer.setViewport(0, 0, width, height);
    renderer.setScissorTest(false);
    renderer.clear();
    renderer.render(scene, camera);

    axesCamera.position.copy(camera.position);
    axesCamera.position.sub(controls.target);
    axesCamera.position.setLength(2);
    axesCamera.lookAt(axesScene.position);

    renderer.clearDepth();

    const size = 100;
    renderer.setViewport(10, 10, size, size);
    renderer.setScissor(10, 10, size, size);
    renderer.setScissorTest(true);
    renderer.render(axesScene, axesCamera);
    renderer.setScissorTest(false);

    controls.update();
  }


  const selectionManager = enableSelectionBox(canvas, scene, camera,onTextChange,controls);

  animate();

  return {
    addObject: (atom, pos) => {
      const number = symbol_to_number[atom];
      const newAtom = addAtoms(scene, number, pos);
      if (newAtom) {
        const newSet = new Set([newAtom]);
        selectionManager.select(newSet);
        const index = scene.children.indexOf(newAtom)-3;
        onTextChange("#"+index+" "+newAtom.name+": " + newAtom.position.x.toFixed(3)+"Å, "+ newAtom.position.y.toFixed(3)+"Å, "+ newAtom.position.z.toFixed(3)+"Å");
        nonCell = false;
      }
    },
    getScene: () => scene,
    getCamera: () => camera,
    getRenderer: () => renderer,
    getNumbers: () => {
      return scene.children.filter(child => child.isMesh).map(child => child.number)
    },
    getPositions: () => {
      return scene.children.filter(child => child.isMesh).map(child => [child.position.x,child.position.y,child.position.z])
    },
    getCell: () => cellMatrix,
    getPBC: () => pbc,
    getText: ()=> selectionManager.gettext(),
    setCell:(newCellMatrix)=> {
      cellMatrix = newCellMatrix;
      updateCellBox(camera,controls);
    },
    setPBC: (newpbc) => pbc = newpbc,
    setMove: () => selectionManager.setMove(),
    setRotate: () => selectionManager.setRotate(),
    copy: () => selectionManager.copy(),
    deleteAtoms: () => selectionManager.deleteAtoms(),
    cut: () => selectionManager.cut(),
    paste: (setCellVectors) => selectionManager.paste(setCellVectors),
    modify: (element) => selectionManager.modify(element),
  };
}

const elements = [
  ["H", 0xffffff, 0.25],
  ["He", 0xd9ffff, 0.31],
  ["Li", 0xcc80ff, 1.45],
  ["Be", 0xc2ff00, 1.05],
  ["B", 0xffb5b5, 0.85],
  ["C", 0x909090, 0.7],
  ["N", 0x3050f8, 0.65],
  ["O", 0xff0d0d, 0.6],
  ["F", 0x90e050, 0.5],
  ["Ne", 0xb3e3f5, 0.38],
  ["Na", 0xab5cf2, 1.8],
  ["Mg", 0x8aff00, 1.5],
  ["Al", 0xbfa6a6, 1.25],
  ["Si", 0xf0c8a0, 1.1],
  ["P", 0xff8000, 1.0],
  ["S", 0xffff30, 1.0],
  ["Cl", 0x1ff01f, 1.0],
  ["Ar", 0x80d1e3, 0.71],
  ["K", 0x8f40d4, 2.2],
  ["Ca", 0x3dff00, 1.8],
  ["Sc", 0xe6e6e6, 1.6],
  ["Ti", 0xbfc2c7, 1.4],
  ["V", 0xa6a6ab, 1.35],
  ["Cr", 0x8a99c7, 1.4],
  ["Mn", 0x9c7ac7, 1.4],
  ["Fe", 0xe06633, 1.4],
  ["Co", 0xf090a0, 1.35],
  ["Ni", 0x50d050, 1.35],
  ["Cu", 0xc88033, 1.35],
  ["Zn", 0x7d80b0, 1.35],
  ["Ga", 0xc28f8f, 1.3],
  ["Ge", 0x668f8f, 1.25],
  ["As", 0xbd80e3, 1.15],
  ["Se", 0xffa100, 1.15],
  ["Br", 0xa62929, 1.15],
  ["Kr", 0x5cb8d1, 0.88],
  ["Rb", 0x702eb0, 2.35],
  ["Sr", 0x00ff00, 2.0],
  ["Y", 0x94ffff, 1.85],
  ["Zr", 0x94e0e0, 1.55],
  ["Nb", 0x73c2c9, 1.45],
  ["Mo", 0x54b5b5, 1.45],
  ["Tc", 0x3b9e9e, 1.35],
  ["Ru", 0x248f8f, 1.3],
  ["Rh", 0x0a7d8c, 1.35],
  ["Pd", 0x006985, 1.4],
  ["Ag", 0xc0c0c0, 1.6],
  ["Cd", 0xffd98f, 1.55],
  ["In", 0xa67573, 1.55],
  ["Sn", 0x668080, 1.45],
  ["Sb", 0x9e63b5, 1.45],
  ["Te", 0xd47a00, 1.4],
  ["I", 0x940094, 1.4],
  ["Xe", 0x429eb0, 1.08],
  ["Cs", 0x57178f, 2.6],
  ["Ba", 0x00c900, 2.15],
  ["La", 0x70d4ff, 1.95],
  ["Ce", 0xffffc7, 1.85],
  ["Pr", 0xd9ffc7, 1.85],
  ["Nd", 0xc7ffc7, 1.85],
  ["Pm", 0xa3ffc7, 1.85],
  ["Sm", 0x8fffc7, 1.85],
  ["Eu", 0x61ffc7, 1.85],
  ["Gd", 0x45ffc7, 1.8],
  ["Tb", 0x30ffc7, 1.75],
  ["Dy", 0x1fffc7, 1.75],
  ["Ho", 0x00ff9c, 1.75],
  ["Er", 0x00e675, 1.75],
  ["Tm", 0x00d452, 1.75],
  ["Yb", 0x00bf38, 1.75],
  ["Lu", 0x00ab24, 1.75],
  ["Hf", 0x4dc2ff, 1.55],
  ["Ta", 0x4da6ff, 1.45],
  ["W", 0x2194d6, 1.35],
  ["Re", 0x267dab, 1.35],
  ["Os", 0x266696, 1.3],
  ["Ir", 0x175487, 1.35],
  ["Pt", 0xd0d0e0, 1.35],
  ["Au", 0xffd123, 1.35],
  ["Hg", 0xb8b8d0, 1.5],
  ["Tl", 0xa6544d, 1.9],
  ["Pb", 0x575961, 1.8],
  ["Bi", 0x9e4fb5, 1.6],
  ["Po", 0xab5c00, 1.9],
  ["At", 0x754f45, 1.27],
  ["Rn", 0x428296, 1.2],
  ["Fr", 0x420066, null],
  ["Ra", 0x007d00, 2.15],
  ["Ac", 0x70abfa, 1.95],
  ["Th", 0x00baff, 1.8],
  ["Pa", 0x00a1ff, 1.8],
  ["U", 0x008fff, 1.75],
  ["Np", 0x0080ff, 1.75],
  ["Pu", 0x006bff, 1.75],
  ["Am", 0x545cf2, 1.75],
  ["Cm", 0x785ce3, null],
  ["Bk", 0x8a4fe3, null],
  ["Cf", 0xa136d4, null],
  ["Es", 0xb31fd4, null],
  ["Fm", 0xb31fba, null],
  ["Md", 0xb30da6, null],
  ["No", 0xbd0d87, null],
  ["Lr", 0xc70066, null],
  ["Rf", 0xcc0059, null],
  ["Db", 0xd1004f, null],
  ["Sg", 0xd90045, null],
  ["Bh", 0xe00038, null],
  ["Hs", 0xe6002e, null],
  ["Mt", 0xeb0026, null]
];

const symbol_to_number = {
  "H": 1,  "He": 2,
  "Li": 3,  "Be": 4,  "B": 5,   "C": 6,   "N": 7,   "O": 8,   "F": 9,   "Ne": 10,
  "Na": 11, "Mg": 12, "Al": 13, "Si": 14, "P": 15,  "S": 16,  "Cl": 17, "Ar": 18,
  "K": 19,  "Ca": 20, "Sc": 21, "Ti": 22, "V": 23,  "Cr": 24, "Mn": 25, "Fe": 26, "Co": 27, "Ni": 28, "Cu": 29, "Zn": 30,
  "Ga": 31, "Ge": 32, "As": 33, "Se": 34, "Br": 35, "Kr": 36,
  "Rb": 37, "Sr": 38, "Y": 39,  "Zr": 40, "Nb": 41, "Mo": 42, "Tc": 43, "Ru": 44, "Rh": 45, "Pd": 46, "Ag": 47, "Cd": 48,
  "In": 49, "Sn": 50, "Sb": 51, "Te": 52, "I": 53,  "Xe": 54,
  "Cs": 55, "Ba": 56, "La": 57, "Ce": 58, "Pr": 59, "Nd": 60, "Pm": 61, "Sm": 62, "Eu": 63, "Gd": 64, "Tb": 65, "Dy": 66,
  "Ho": 67, "Er": 68, "Tm": 69, "Yb": 70, "Lu": 71,
  "Hf": 72, "Ta": 73, "W": 74,  "Re": 75, "Os": 76, "Ir": 77, "Pt": 78, "Au": 79, "Hg": 80,
  "Tl": 81, "Pb": 82, "Bi": 83, "Po": 84, "At": 85, "Rn": 86,
  "Fr": 87, "Ra": 88, "Ac": 89, "Th": 90, "Pa": 91, "U": 92,  "Np": 93, "Pu": 94, "Am": 95, "Cm": 96, "Bk": 97, "Cf": 98,
  "Es": 99, "Fm": 100, "Md": 101, "No": 102, "Lr": 103,
  "Rf": 104, "Db": 105, "Sg": 106, "Bh": 107, "Hs": 108, "Mt": 109
}

function addAtoms(scene,number,pos){
  const info = elements[number-1];
  const radius = info[2];
  const color = info[1];

  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshPhongMaterial({ color:color });
  material.shininess = 300;
  material.opacity = 1.0;
  material.transparent = false;
  material.depthWrite = true;
  material.depthTest = true;
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(pos[0], pos[1], pos[2]);
  sphere.number = number;
  sphere.name = info[0];
  sphere.userData.originalMaterial = sphere.material;
  const outline = createOutlineMesh(sphere, 0x003000,0.08);
  outline.position.set(0,0,0);
  outline.material.transparent = true;
  outline.material.opacity = 0;
  sphere.add(outline)
  scene.add(sphere);
  return sphere;
}


function enableSelectionBox(canvas,scene,camera,textchange,controls) {
  const rect = canvas.getBoundingClientRect();
  const absRectTop = rect.top + window.scrollY;
  const absRectLeft = rect.left + window.scrollX;  
  
  const selectionBox = document.createElement('div');
  selectionBox.style.position = 'absolute';
  selectionBox.style.border = '1px dashed #000';
  selectionBox.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
  selectionBox.style.pointerEvents = 'none';
  selectionBox.style.display = 'none';
  document.body.appendChild(selectionBox);

  let isclicking = false;
  let isDragged = 0;
  let startX = 0, startY = 0;
  let text = '';

  let outlineGroup = null;
  
  let selected = new Set();


  canvas.addEventListener('mousedown', (e) => {
    
    if (e.button !== 0) return; 
    isclicking = true;

    startX = e.clientX + window.scrollX;
    startY = e.clientY + window.scrollY;
  });
  canvas.addEventListener('mousemove', (e) => {
    if (!isclicking) return;
    isDragged += 1;

    const currentX = e.clientX + window.scrollX;
    const currentY = e.clientY + window.scrollY;

    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(startX - currentX);
    const height = Math.abs(startY - currentY);

    selectionBox.style.left = `${left}px`;
    selectionBox.style.top = `${top}px`;
    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;
    selectionBox.style.display = 'block';
    selectionBox.style.zIndex = '1000';
  });

  canvas.addEventListener('mouseup', (e) => {
    if (!isclicking) return;

    if(!e.ctrlKey && selected.size > 0){
      selected.forEach(obj => {
        const outline = obj.children[0]
        if(outline){
          outline.material.opacity = 0;
        }
      })
      selected = new Set();
    }
    if(isDragged > 2){
      const selectionLeft = Math.min(startX, e.clientX + window.scrollX);
      const selectionTop = Math.min(startY, e.clientY + window.scrollY);
      const selectionRight = Math.max(startX, e.clientX + window.scrollX);
      const selectionBottom = Math.max(startY, e.clientY + window.scrollY);
  
  
  
      scene.children.forEach((object) => {
        if (object.isMesh && object.geometry.type === 'SphereGeometry') {
          const pos = object.position.clone();
          pos.project(camera);
      
          const screenX = (pos.x + 1) / 2 * rect.width + absRectLeft;
          const screenY = (-pos.y + 1) / 2 * rect.height + absRectTop;
      
          if (
            screenX >= selectionLeft && screenX <= selectionRight &&
            screenY >= selectionTop && screenY <= selectionBottom
          ) {
            selected.add(object);
          }
        }
      });
    } else {
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      mouse.x = ((startX - absRectLeft) / rect.width) * 2 - 1;
      mouse.y = -((startY - absRectTop) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const sphereObjects = scene.children.filter(child => child.isMesh)
      const intersects = raycaster.intersectObjects(sphereObjects, false);
      if (intersects.length > 0){
        const intersectedObject = intersects[0].object;
        if(selected.has(intersectedObject)){
          selected.delete(intersectedObject);
          intersectedObject.children[0].material.opacity = 0
        } else {
          selected.add(intersectedObject);
        }
      }
    }

    if (selected.size > 0) {
      selected.forEach(obj => {
        obj.children.forEach(outline => {
          outline.material.opacity = 1;
        })
      })
      if(selected.size == 1){
        const target = selected.values().next().value;
        const index = scene.children.indexOf(target)-3;
        textchange("#"+index+" "+target.name+": " + target.position.x.toFixed(3)+"Å, "+ target.position.y.toFixed(3)+"Å, "+ target.position.z.toFixed(3)+"Å");
      }else if(selected.size == 2){
        const [obj1,obj2] = selected;
        const pos1 = new THREE.Vector3();
        const pos2 = new THREE.Vector3();
      
        obj1.getWorldPosition(pos1);
        obj2.getWorldPosition(pos2);
      
        const distance = pos1.distanceTo(pos2);
        textchange(obj1.name+"-"+obj2.name+": "+distance.toFixed(3)+"Å")
      }else if(selected.size == 3){
        const [obj1,obj2,obj3] = selected;
        const p1 = new THREE.Vector3();
        const p2 = new THREE.Vector3();
        const p3 = new THREE.Vector3();
      
        obj1.getWorldPosition(p1);
        obj2.getWorldPosition(p2);
        obj3.getWorldPosition(p3);
      

        const a = p2.clone().sub(p3);
        const b = p1.clone().sub(p3);
        const c = p1.clone().sub(p2);
      
        const angleA = b.negate().angleTo(c.negate());
        const angleB = c.angleTo(a);
        const angleC = a.negate().angleTo(b);
      

        const toDegrees = rad => (rad * 180) / Math.PI;
        textchange(obj1.name+"-"+obj2.name+"-"+obj3.name+": "+toDegrees(angleA).toFixed(1)+"°, "+toDegrees(angleB).toFixed(1)+"°, "+toDegrees(angleC).toFixed(1)+"°")
      }else{ textchange(selected.size+" atoms")}
      
    } else {
      textchange("")
    }
    isclicking = false;
    isDragged = 0;
    selectionBox.style.display = 'none';
  });


  let move = []; 
  let movegroup;
  let rotate = [];
  let rotategroup;
  let center;

  window.addEventListener("keydown", (e) => {
    const tag = document.activeElement.tagName.toLowerCase();
  
    if (tag === 'input' || tag === 'textarea') return;

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      if(move.length> 0){
        const delta = new THREE.Vector3();
        const speed = 0.1;
        
        const cameraMatrix = new THREE.Matrix4().extractRotation(camera.matrixWorld);
        const cameraUp = new THREE.Vector3(0, 1, 0).applyMatrix4(cameraMatrix).normalize();
        const cameraRight = new THREE.Vector3(1, 0, 0).applyMatrix4(cameraMatrix).normalize();
        if (e.key === "ArrowRight") delta.add(cameraRight.clone().multiplyScalar(speed));
        if (e.key === "ArrowLeft")  delta.add(cameraRight.clone().multiplyScalar(-speed));
        if (e.key === "ArrowUp")    delta.add(cameraUp.clone().multiplyScalar(speed));
        if (e.key === "ArrowDown")  delta.add(cameraUp.clone().multiplyScalar(-speed));
        move.forEach(obj => {
          obj.position.add(delta);
        });
        movegroup.children.forEach(child => {
          child.position.add(delta)
        })
      }
      else if(rotate.length> 0){
        rotateObjectsRelativeToCamera(rotate,rotategroup.children, camera, center, e.key);
      };
    }

    if (selected.size > 0) {
      if(selected.size == 1){
        const target = selected.values().next().value;
        const index = scene.children.indexOf(target)-3;
        textchange("#"+index+" "+target.name+": " + target.position.x.toFixed(3)+"Å, "+ target.position.y.toFixed(3)+"Å, "+ target.position.z.toFixed(3)+"Å");
      }else if(selected.size == 2){
        const [obj1,obj2] = selected;
        const pos1 = new THREE.Vector3();
        const pos2 = new THREE.Vector3();
      
        obj1.getWorldPosition(pos1);
        obj2.getWorldPosition(pos2);
      
        const distance = pos1.distanceTo(pos2);
        textchange(obj1.name+"-"+obj2.name+": "+distance.toFixed(3)+"Å")
      }else if(selected.size == 3){
        const [obj1,obj2,obj3] = selected;
        const p1 = new THREE.Vector3();
        const p2 = new THREE.Vector3();
        const p3 = new THREE.Vector3();
      
        obj1.getWorldPosition(p1);
        obj2.getWorldPosition(p2);
        obj3.getWorldPosition(p3);
      
        const a = p2.clone().sub(p3); 
        const b = p1.clone().sub(p3); 
        const c = p1.clone().sub(p2); 
      
        const angleA = b.negate().angleTo(c.negate()); 
        const angleB = c.angleTo(a); 
        const angleC = a.negate().angleTo(b); 
      

        const toDegrees = rad => (rad * 180) / Math.PI;
        textchange(obj1.name+"-"+obj2.name+"-"+obj3.name+": "+toDegrees(angleA).toFixed(1)+"°, "+toDegrees(angleB).toFixed(1)+"°, "+toDegrees(angleC).toFixed(1)+"°")
      }else{ textchange(selected.size+" atoms")}
      console.log('グループ化したオブジェクト数:', selected.size);
    }
  });
  return {
    getSelected: () => selected,
    select: (newSet) => select(newSet),
    setMove: () => setMove(),
    setRotate: () => setRotate(),
    copy: () => copy(),
    deleteAtoms: () => {
      if(selected.size > 0){
        const shouldProceed = window.confirm("Delete selected atoms?");
        if (shouldProceed) {deleteAtoms();}
      }
    },
    cut: () => {
      copy();
      deleteAtoms();
    },
    paste: (setCellVectors) => paste(setCellVectors),
    modify: (element) => modify(element),
  };

  function select(newSet){
    selected.forEach(obj => {
      const outline = obj.children[0];
      if (outline) outline.material.opacity = 0;
    });
    selected.clear();
    newSet.forEach(obj => {
      selected.add(obj);
      const outline = obj.children[0];
      if (outline) outline.material.opacity = 1;
    });
  };

  function setMove() {
    if (rotate.length > 0) {
      rotate = [];
      scene.remove(rotategroup)
      console.log("rotate list cleared");
    };
    if (move.length > 0) {
      move = [];
      scene.remove(movegroup)
      console.log("move list cleared");
    } else {
      move = [...selected];
      movegroup = new THREE.Group();
      move.forEach(obj => {
        movegroup.add(createOutlineMesh(obj, 0x00ff00,0.15))
      })
      scene.add(movegroup)
      console.log("selected items moved to move list");
    }
  };
  
  function setRotate(){
    if (move.length > 0) {
      move = [];
      scene.remove(movegroup)
      console.log("move list cleared");
    };
    if (rotate.length > 0) {
      rotate = [];
      scene.remove(rotategroup)
      console.log("rotate list cleared");
    } else {
      rotate = [...selected];
      rotategroup = new THREE.Group();
      center = new THREE.Vector3(0,0,0);
      rotate.forEach(obj => {
        rotategroup.add(createOutlineMesh(obj, 0xff00ff,0.15))
        center.add(obj.position);
      })
      center.divideScalar(rotate.length);
      scene.add(rotategroup)
      console.log("selected items moved to rotate list");
    }
  };

  function copy(){
    const numbers = [...selected].map(obj => obj.number);
    const flatPositions = Array.from(selected).flatMap(sphere => [sphere.position.x, sphere.position.y, sphere.position.z]);
    var copytext = '{"numbers": {"__ndarray__": [[' + selected.size + '], "int64", ['+ numbers +']]}, "positions": {"__ndarray__": [[' + selected.size +', 3], "float64", [' + flatPositions + ']]}, "cell": {"__ndarray__": [[3, 3], "float64", [' + cellMatrix.flat() + ']]}, "pbc": {"__ndarray__": [[3], "bool", [' + pbc + ']]}, "__ase_objtype__": "atoms"}';
    navigator.clipboard.writeText(copytext);
  }

  function deleteAtoms(){
    rotate = [];
    scene.remove(rotategroup)
    move = [];
    scene.remove(movegroup)
    selected.forEach(atom => {
      scene.remove(atom);
      atom.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    });
  }

  function paste(setCellVectors){
    navigator.clipboard.readText()
    .then(text => {
      try{
        const json = JSON.parse(text);
        const numbers = parseNdArray(json.numbers);
        const positions = parseNdArray(json.positions);
        if(nonCell){
          cellMatrix = parseNdArray(json.cell);
          setCellVectors(cellMatrix);
          updateCellBox(camera,controls);
          pbc = parseNdArray(json.pbc);
        };
        const newSet = new Set();
        numbers.forEach((number, i) => {
          const newAtom = addAtoms(scene, number, positions[i]);
          newSet.add(newAtom);
        });
        select(newSet);
      } catch (err){
        console.log(err);
        alert("Pasting currently works only with the ASE JSON format.");
      }
    })
    .catch(err => {
      alert("Failed to read clipboard content.");
    });
  };

  function modify(element) {
    move = [];
    scene.remove(movegroup);
    rotate = [];
    scene.remove(rotategroup);

    const atomic_number = symbol_to_number[element];
    const info = elements[atomic_number - 1];
    const radius = info[2];
    const color = info[1];
  
    for (const value of selected) {
      value.geometry.dispose();
      value.geometry = new THREE.SphereGeometry(radius, 32, 32);
      value.material.color.set(color);
      value.number = atomic_number;
      value.name = element;
      const outline = value.children[0];
      outline.geometry.dispose();
      const outlineRadius = radius + 0.08;
      outline.geometry = new THREE.SphereGeometry(outlineRadius, 32, 32);
    }
  }
}




function drawCellBox(scene, camera, controls) {
  // セルの3つのベクトル（a, b, c）を取り出す
  const a = new THREE.Vector3(...cellMatrix[0]);
  const b = new THREE.Vector3(...cellMatrix[1]);
  const c = new THREE.Vector3(...cellMatrix[2]);

  // 8つの頂点を計算（原点から順に）
  const origin = new THREE.Vector3(0, 0, 0);
  const ab = new THREE.Vector3().addVectors(a, b);
  const ac = new THREE.Vector3().addVectors(a, c);
  const bc = new THREE.Vector3().addVectors(b, c);
  const abc = new THREE.Vector3().addVectors(ab, c);

  const vertices = [
    origin, a, a, ab, ab, b, b, origin,  // bottom rectangle
    c, ac, ac, abc, abc, bc, bc, c,      // top rectangle
    origin, c, a, ac, ab, abc, b, bc     // vertical edges
  ];

  const geometry = new THREE.BufferGeometry().setFromPoints(vertices);

  const material = new THREE.LineDashedMaterial({
    color: 0x000000,
    dashSize: 0.2,
    gapSize: 0.1,
    linewidth: 1,
  });

  const line = new THREE.LineSegments(geometry, material);
  line.computeLineDistances(); // 点線に必要！


  var center = new THREE.Vector3();
  cellMatrix.forEach(vec => {
    center.add(new THREE.Vector3(...vec).multiplyScalar(0.5));
  });
  camera.lookAt(center)
  controls.target.copy(center);
  controls.update();

  scene.add(line);
  return line;
}

function updateCellBox(camera,controls) {
  const a = new THREE.Vector3(...cellMatrix[0]);
  const b = new THREE.Vector3(...cellMatrix[1]);
  const c = new THREE.Vector3(...cellMatrix[2]);

  const origin = new THREE.Vector3(0, 0, 0);
  const ab = new THREE.Vector3().addVectors(a, b);
  const ac = new THREE.Vector3().addVectors(a, c);
  const bc = new THREE.Vector3().addVectors(b, c);
  const abc = new THREE.Vector3().addVectors(ab, c);

  const vertices = [
    origin, a, a, ab, ab, b, b, origin,
    c, ac, ac, abc, abc, bc, bc, c,
    origin, c, a, ac, ab, abc, b, bc
  ];

  const positionAttr = line.geometry.attributes.position;
  for (let i = 0; i < vertices.length; i++) {
    positionAttr.setXYZ(i, vertices[i].x, vertices[i].y, vertices[i].z);
  }

  positionAttr.needsUpdate = true;
  line.geometry.computeBoundingSphere(); // オプション（描画最適化）
  line.computeLineDistances(); // 点線のために必要！

  var center = new THREE.Vector3();
  cellMatrix.forEach(vec => {
    center.add(new THREE.Vector3(...vec).multiplyScalar(0.5));
  });
  camera.lookAt(center)
  controls.target.copy(center);
  controls.update();
  nonCell = false;
}

function parseNdArray(ndarrayObj) {
  const [shape, dtype, flatData] = ndarrayObj["__ndarray__"];
  if (shape.length === 1) {
    return flatData;
  } else if (shape.length === 2) {
    const [rows, cols] = shape;
    const result = [];
    for (let r = 0; r < rows; r++) {
      result.push(flatData.slice(r * cols, (r + 1) * cols));
    }
    return result;
  }
  return flatData;
}



function createOutlineMesh(originalMesh, color = 0x000000,rad = 0.05) {
  const outlineMaterial = new THREE.MeshBasicMaterial({
    color,
    side: THREE.BackSide
  });
  const radius = elements[originalMesh.number-1][2] + rad;
  const geo = new THREE.SphereGeometry(radius, 32, 32);
  const outlineMesh = new THREE.Mesh(geo, outlineMaterial);
  outlineMesh.position.copy(originalMesh.position);

  return outlineMesh;
}



function rotateObjectsRelativeToCamera(objects1,objects2, camera, center, direction) {
  const angle = Math.PI / 60; // 1回のキー入力での回転角（調整可能）
  let axis;

  switch (direction) {
    case 'ArrowLeft':
      // カメラの "上" ベクトルに垂直（= -right）方向に回転（Z軸に対する水平回転）
      axis = new THREE.Vector3().crossVectors(camera.up, camera.getWorldDirection(new THREE.Vector3())).normalize();
      break;
    case 'ArrowRight':
      axis = new THREE.Vector3().crossVectors(camera.getWorldDirection(new THREE.Vector3()), camera.up).normalize();
      break;
    case 'ArrowUp':
      // カメラの右方向に回転（= pitch down）
      axis = new THREE.Vector3().crossVectors(camera.getWorldDirection(new THREE.Vector3()), new THREE.Vector3().crossVectors(camera.up, camera.getWorldDirection(new THREE.Vector3()))).normalize();
      break;
    case 'ArrowDown':
      axis = new THREE.Vector3().crossVectors(new THREE.Vector3().crossVectors(camera.up, camera.getWorldDirection(new THREE.Vector3())), camera.getWorldDirection(new THREE.Vector3())).normalize();
      break;
    default:
      return;
  }

  const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);

  objects1.forEach(obj => {
    const pos = obj.position.clone().sub(center); // 中心からの相対位置
    pos.applyQuaternion(quaternion);             // 回転
    obj.position.copy(pos.add(center));           // 回転後の位置に戻す
    obj.quaternion.premultiply(quaternion);       // 見た目の回転も適用（必要なら）
  });
  objects2.forEach(obj => {
    const pos = obj.position.clone().sub(center); // 中心からの相対位置
    pos.applyQuaternion(quaternion);             // 回転
    obj.position.copy(pos.add(center));           // 回転後の位置に戻す
    obj.quaternion.premultiply(quaternion);       // 見た目の回転も適用（必要なら）
  });
}



//-------------------------------------------------------------------------------------------------

export default renderAtoms3D;
