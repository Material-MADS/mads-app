/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2025)
//          Last Update: Q4 2025
// ________________________________________________________________________________________________
// Authors: Shotaro Okamoto [2025]
// ________________________________________________________________________________________________
// Description: This is a 'Form Field' React Component (used in data editing/displaying forms)
//              of the 'Dropzone' type
// ------------------------------------------------------------------------------------------------
// Notes: 'Form Fields' are component used inside all forms for editing and viewing connected data.
//        'Dropzone' is of classic type, look and feel. (Multiple is allowed )
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
// The FormField Component
//-------------------------------------------------------------------------------------------------


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
  container.appendChild(renderer.domElement);

  // light
  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1).normalize();
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);
  

 
  console.log("setViewerText の中身:", onTextChange);

  var cellMatrix
  // write atoms
  if(atomsData.positions){
    atomsData.positions.forEach((pos, i) => {
      const symbol = atomsData.symbols[i];
      addAtoms(scene,symbol,pos)
    });
    cellMatrix = atomsData.cell; 
    drawCellBox(cellMatrix, scene);
  }

  const center = new THREE.Vector3();

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

  camera.position.set(-10,5,4);
  camera.lookAt(center)




  const controls = new OrbitControls(camera,renderer.domElement);



  cellMatrix.forEach(vec => {
    center.add(new THREE.Vector3(...vec).multiplyScalar(0.5));
  });
  
  controls.mouseButtons.LEFT = null;
  controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
  controls.target.copy(center);
  controls.update();






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


  const selectionManager = enableSelectionBox(renderer, scene, camera,onTextChange);

  animate();

  return {
    addObject: (atom, pos) => {
      addAtoms(scene, atom, pos);
      const newAtom = scene.children.find(child =>
        child.isMesh && child.position.x === pos[0] &&
        child.position.y === pos[1] && child.position.z === pos[2]
      );
      if (newAtom) {
        const newSet = new Set([newAtom]);
        selectionManager.setSelected(newSet);
      }
    },
    getScene: () => scene,
    getCamera: () => camera,
    getRenderer: () => renderer,
    getAtoms: () => {
      return scene.children.filter(child => child.isMesh).map(child => child.name)
    },
    getPositions: () => {
      return scene.children.filter(child => child.isMesh).map(child => [child.position.x,child.position.y,child.position.z])
    },
    getcell: () => cellMatrix,
    getPBC: () => atomsData.pbc,
    getText: ()=> selectionManager.gettext(),
  };
}

// 元素記号に対応する色
function getElementColor(symbol) {
  const colors = {
    H: 0xffffff,
    He: 0xd9ffff,
    Li: 0xcc80ff,
    Be: 0xc2ff00,
    B: 0xffb5b5,
    C: 0x909090,
    N: 0x3050f8,
    O: 0xff0d0d,
    F: 0x90e050,
    Ne: 0xb3e3f5,
    Na: 0xab5cf2,
    Mg: 0x8aff00,
    Al: 0xbfa6a6,
    Si: 0xf0c8a0,
    P: 0xff8000,
    S: 0xffff30,
    Cl: 0x1ff01f,
    Ar: 0x80d1e3,
    K: 0x8f40d4,
    Ca: 0x3dff00,
    Sc: 0xe6e6e6,
    Ti: 0xbfc2c7,
    V: 0xa6a6ab,
    Cr: 0x8a99c7,
    Mn: 0x9c7ac7,
    Fe: 0xe06633,
    Co: 0xf090a0,
    Ni: 0x50d050,
    Cu: 0xc88033,
    Zn: 0x7d80b0,
    Ga: 0xc28f8f,
    Ge: 0x668f8f,
    As: 0xbd80e3,
    Se: 0xffa100,
    Br: 0xa62929,
    Kr: 0x5cb8d1,
    Rb: 0x702eb0,
    Sr: 0x00ff00,
    Y: 0x94ffff,
    Zr: 0x94e0e0,
    Nb: 0x73c2c9,
    Mo: 0x54b5b5,
    Tc: 0x3b9e9e,
    Ru: 0x248f8f,
    Rh: 0x0a7d8c,
    Pd: 0x006985,
    Ag: 0xc0c0c0,
    Cd: 0xffd98f,
    In: 0xa67573,
    Sn: 0x668080,
    Sb: 0x9e63b5,
    Te: 0xd47a00,
    I: 0x940094,
    Xe: 0x429eb0,
    Cs: 0x57178f,
    Ba: 0x00c900,
    La: 0x70d4ff,
    Ce: 0xffffc7,
    Pr: 0xd9ffc7,
    Nd: 0xc7ffc7,
    Pm: 0xa3ffc7,
    Sm: 0x8fffc7,
    Eu: 0x61ffc7,
    Gd: 0x45ffc7,
    Tb: 0x30ffc7,
    Dy: 0x1fffc7,
    Ho: 0x00ff9c,
    Er: 0x00e675,
    Tm: 0x00d452,
    Yb: 0x00bf38,
    Lu: 0x00ab24,
    Hf: 0x4dc2ff,
    Ta: 0x4da6ff,
    W: 0x2194d6,
    Re: 0x267dab,
    Os: 0x266696,
    Ir: 0x175487,
    Pt: 0xd0d0e0,
    Au: 0xffd123,
    Hg: 0xb8b8d0,
    Tl: 0xa6544d,
    Pb: 0x575961,
    Bi: 0x9e4fb5,
    Po: 0xab5c00,
    At: 0x754f45,
    Rn: 0x428296,
    Fr: 0x420066,
    Ra: 0x007d00,
    Ac: 0x70abfa,
    Th: 0x00baff,
    Pa: 0x00a1ff,
    U: 0x008fff,
    Np: 0x0080ff,
    Pu: 0x006bff,
    Am: 0x545cf2,
    Cm: 0x785ce3,
    Bk: 0x8a4fe3,
    Cf: 0xa136d4,
    Es: 0xb31fd4,
    Fm: 0xb31fba,
    Md: 0xb30da6,
    No: 0xbd0d87,
    Lr: 0xc70066,
    Rf: 0xcc0059,
    Db: 0xd1004f,
    Sg: 0xd90045,
    Bh: 0xe00038,
    Hs: 0xe6002e,
    Mt: 0xeb0026
  };
  const radius = {
    H: 0.25,
    He: 0.31,
    Li: 1.45,
    Be: 1.05,
    B: 0.85,
    C: 0.7,
    N: 0.65,
    O: 0.6,
    F: 0.5,
    Ne: 0.38,
    Na: 1.8,
    Mg: 1.5,
    Al: 1.25,
    Si: 1.1,
    P: 1,
    S: 1,
    Cl: 1,
    Ar: 0.71,
    K: 2.2,
    Ca: 1.8,
    Sc: 1.6,
    Ti: 1.4,
    V: 1.35,
    Cr: 1.4,
    Mn: 1.4,
    Fe: 1.4,
    Co: 1.35,
    Ni: 1.35,
    Cu: 1.35,
    Zn: 1.35,
    Ga: 1.3,
    Ge: 1.25,
    As: 1.15,
    Se: 1.15,
    Br: 1.15,
    Kr: 0.88,
    Rb: 2.35,
    Sr: 2,
    Y: 1.85,
    Zr: 1.55,
    Nb: 1.45,
    Mo: 1.45,
    Tc: 1.35,
    Ru: 1.3,
    Rh: 1.35,
    Pd: 1.4,
    Ag: 1.6,
    Cd: 1.55,
    In: 1.55,
    Sn: 1.45,
    Sb: 1.45,
    Te: 1.4,
    I: 1.4,
    Xe: 1.08,
    Cs: 2.6,
    Ba: 2.15,
    La: 1.95,
    Ce: 1.85,
    Pr: 1.85,
    Nd: 1.85,
    Pm: 1.85,
    Sm: 1.85,
    Eu: 1.85,
    Gd: 1.8,
    Tb: 1.75,
    Dy: 1.75,
    Ho: 1.75,
    Er: 1.75,
    Tm: 1.75,
    Yb: 1.75,
    Lu: 1.75,
    Hf: 1.55,
    Ta: 1.45,
    W: 1.35,
    Re: 1.35,
    Os: 1.3,
    Ir: 1.35,
    Pt: 1.35,
    Au: 1.35,
    Hg: 1.5,
    Tl: 1.9,
    Pb: 1.8,
    Bi: 1.6,
    Po: 1.9,
    At: 1.27,
    Rn: 1.2,
    Ra: 2.15,
    Ac: 1.95,
    Th: 1.8,
    Pa: 1.8,
    U: 1.75,
    Np: 1.75,
    Pu: 1.75,
    Am: 1.75
  };

  return {color:colors[symbol], radius:radius[symbol]}
}

function addAtoms(scene,symbol,pos){
  const info = getElementColor(symbol);
  const radius = info.radius;
  const color = info.color;

  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshPhongMaterial({ color:color });
  material.shininess = 300;
  material.opacity = 1.0;
  material.transparent = false;
  material.depthWrite = true;
  material.depthTest = true;
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(pos[0], pos[1], pos[2]);
  sphere.name = symbol
  sphere.userData.originalMaterial = sphere.material;
  const outline = createOutlineMesh(sphere, 0x003000,0.08);
  outline.position.set(0,0,0);
  outline.material.transparent = true;
  outline.material.opacity = 0;
  sphere.add(outline)
  scene.add(sphere);
}


function enableSelectionBox(renderer,scene,camera,textchange) {
  const domElement = renderer.domElement;
  const rect = renderer.domElement.getBoundingClientRect();
  
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


  domElement.addEventListener('mousedown', (e) => {
    
    if (e.button !== 0) return; // 左クリックのみ対象
    isclicking = true;

    startX = e.clientX + window.scrollX;
    startY = e.clientY + window.scrollY;
  });
  domElement.addEventListener('mousemove', (e) => {
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

  domElement.addEventListener('mouseup', (e) => {
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
          pos.project(camera); // 3D位置をスクリーン座標に変換
      
          const screenX = (pos.x + 1) / 2 * rect.width + rect.left;
          const screenY = (-pos.y + 1) / 2 * rect.height + rect.top;
      
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
      mouse.x = ((startX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((startY - rect.top) / rect.height) * 2 + 1;
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
      // --- 新しいグループを作成し、選択されたオブジェクトをグループ化
      //outlinePass.selectedObjects = [...selected];
      selected.forEach(obj => {
        obj.children.forEach(outline => {
          outline.material.opacity = 1;
        })
      })
      if(selected.size == 1){
        textchange(selected.values().next().value.name);
        text = selected.values().next().value.name;
      }
      console.log('グループ化したオブジェクト数:', selected.size);
      
    } else {
      console.log('選択されたオブジェクトはありません');
    }

    isclicking = false;
    isDragged = 0;
    selectionBox.style.display = 'none';
  });


  let move = []; 
  let movegroup
  let rotate = [];
  let rotategroup
  let center;

  window.addEventListener("keydown", (e) => {
    const tag = document.activeElement.tagName.toLowerCase();
  
    // フォームにフォーカスがあるときは何もしない（preventDefaultもしない）
    if (tag === 'input' || tag === 'textarea') return;

    e.preventDefault();


    if (e.ctrlKey && e.key.toLowerCase() === "m") {
      if (rotate.length > 0) {
        // 既に move にオブジェクトがある場合は削除
        rotate = [];
        scene.remove(rotategroup)
        console.log("rotate list cleared");
      };
      if (move.length > 0) {
        // 既に move にオブジェクトがある場合は削除
        move = [];
        scene.remove(movegroup)
        console.log("move list cleared");
      } else {
        // selected の内容を move にコピー
        move = [...selected];
        movegroup = new THREE.Group();
        move.forEach(obj => {
          movegroup.add(createOutlineMesh(obj, 0x00ff00,0.15))
        })
        scene.add(movegroup)
        console.log("selected items moved to move list");
      }
    }

    if (e.ctrlKey && e.key.toLowerCase() === "r") {
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
        // selected の内容を move にコピー
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
    }
    if (e.key === "Backspace") {
      if(selected.size > 0){
        const shouldProceed = window.confirm("Are you sure you want to delete the selected atoms?");
        if (shouldProceed) {
          if (rotate.length > 0) {
            // 既に move にオブジェクトがある場合は削除
            rotate = [];
            scene.remove(rotategroup)
            console.log("rotate list cleared");
          };
          if (move.length > 0) {
            // 既に move にオブジェクトがある場合は削除
            move = [];
            scene.remove(movegroup)
            console.log("move list cleared");
          }
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
      }
    }
    if(move.length> 0){
      const delta = new THREE.Vector3();
      const speed = 0.1;
      
      const cameraMatrix = new THREE.Matrix4().extractRotation(camera.matrixWorld);
      const cameraUp = new THREE.Vector3(0, 1, 0).applyMatrix4(cameraMatrix).normalize();
      const cameraRight = new THREE.Vector3(1, 0, 0).applyMatrix4(cameraMatrix).normalize();
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      }
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
    };

    if(rotate.length> 0){
      rotateObjectsRelativeToCamera(rotate,rotategroup.children, camera, center, e.key);
    };
  });
  return {
    getSelected: () => selected,
    setSelected: (newSet) => {
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
    },
    getMove: () => move,
    setMove: (newSet) => {
      if (rotate.length > 0) {
        // 既に move にオブジェクトがある場合は削除
        rotate = [];
        scene.remove(rotategroup)
        console.log("rotate list cleared");
      };
      move=[...newSet];
    },
    updateMoveGroup: () => {
      if (movegroup) scene.remove(movegroup);
      movegroup = new THREE.Group();
      move.forEach(obj => movegroup.add(createOutlineMesh(obj, 0x00ff00,0.15)));
      scene.add(movegroup);
    },
    gettext:() => text,
  };
}

function drawCellBox(cellMatrix, scene) {
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

  scene.add(line);
}

function createOutlineMesh(originalMesh, color = 0x000000,rad = 0.05) {
  const outlineMaterial = new THREE.MeshBasicMaterial({
    color,
    side: THREE.BackSide
  });
  const radius = getElementColor(originalMesh.name).radius + rad;
  const geo = new THREE.SphereGeometry(radius, 32, 32);
  const outlineMesh = new THREE.Mesh(geo, outlineMaterial);
  outlineMesh.position.copy(originalMesh.position);

  return outlineMesh;
}

function getCenterOfObjects(objects) {
  const center = new THREE.Vector3(0, 0, 0);
  if (objects.length === 0) return center;

  objects.forEach(obj => {
    center.add(obj.position);
  });

  center.divideScalar(objects.length);
  return center;
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
