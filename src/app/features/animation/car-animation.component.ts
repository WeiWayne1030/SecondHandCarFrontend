import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    Group,
    BoxGeometry,
    MeshStandardMaterial,
    MeshPhongMaterial,
    Mesh,
    CylinderGeometry,
    AmbientLight,
    DirectionalLight,
    PointLight,
    SpotLight,
    Color,
    PCFSoftShadowMap,
    Fog,
    Box3,
    Vector3
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
    selector: 'app-car-animation',
    templateUrl: './car-animation.component.html',
    styleUrls: ['./car-animation.component.css']
})
export class CarAnimationComponent implements OnInit, OnDestroy {
    @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;

    private scene: any;
    private camera: any;
    private renderer: any;
    private controls: any; // OrbitControls
    private car: any;
    private animationId: number = 0;
    private startTime: number = 0;
    private animationDuration: number = 2500; // Slightly faster entrance
    private gltfLoader: any; // GLTFLoader instance
    private mixer: any; // For model animations
    private useRealModel: boolean = true; // Toggle this to use real model or fallback
    private isAnimationComplete: boolean = false;
    canClickToProceed: boolean = false; // Public for template binding

    private carCenterOffset = new Vector3();


    constructor(private router: Router) {
        this.gltfLoader = new GLTFLoader();
    }

    ngOnInit(): void {
        this.initThreeJS();
        this.addLights();

        if (this.useRealModel) {
            this.loadCarModel(); // Load GLB model
        } else {
            this.createFallbackCar(); // Use geometric model
        }
    }

    ngOnDestroy(): void {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.forceContextLoss();
        }
        if (this.controls) {
            this.controls.dispose();
        }
        this.scene?.traverse((object: any) => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach((material: any) => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    }

    onClick(): void {
        this.handleNavigation();
    }

    private handleNavigation(): void {
        if (this.canClickToProceed) {
            this.router.navigate(['/home']);
        }
    }

    private initThreeJS(): void {
        this.scene = new Scene();
        this.scene.background = new Color(0x1a1a2e); // Match CSS background
        this.scene.fog = new Fog(0x1a1a2e, 30, 100);

        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera = new PerspectiveCamera(50, width / height, 0.1, 1000);
        this.camera.position.set(0, 1.5, 8); // Initial camera position
        this.camera.lookAt(0, 0, 0);

        this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = PCFSoftShadowMap;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = 1;
        this.renderer.toneMappingExposure = 1.2;
        this.canvasContainer.nativeElement.appendChild(this.renderer.domElement);

        // Initialize OrbitControls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true; // Smooth rotation
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = false; // Disable zoom
        this.controls.enableRotate = false; // Disable manual rotation
        this.controls.autoRotate = true; // Enable auto rotation
        this.controls.autoRotateSpeed = -60; // Clockwise rotation
        this.controls.minDistance = 4; // Adjusted for larger model
        this.controls.maxDistance = 15;
        this.controls.maxPolarAngle = Math.PI / 2;

        // IMPORTANT: Set target to where the car center will be (y=2.0)
        this.controls.target.set(-1.0, 2.0, 0);

        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    private loadCarModel(): void {
        // Path to your GLB file
        const modelPath = '/assets/models/BMWi7.glb';

        this.gltfLoader.load(
            modelPath,
            (gltf: any) => {
                this.car = gltf.scene;

                const box = new Box3().setFromObject(this.car);
                const size = box.getSize(new Vector3());

                // Target size: approximately 10 units long (car length) - increased 60%
                const maxDim = Math.max(size.x, size.y, size.z);
                const targetSize = 8;
                const normalizeScale = targetSize / maxDim;

                this.car.scale.set(normalizeScale, normalizeScale, normalizeScale);

                // Recalculate bounding box and center
                box.setFromObject(this.car);
                const newCenter = box.getCenter(new Vector3());
                this.carCenterOffset.copy(newCenter); // Save for animation use

                // Position: X centered, Y moved up (from 0.5 to 2.0), Z deep in background
                this.car.position.x = -newCenter.x - 3.5;
                this.car.position.y = -newCenter.y + 3.5;
                this.car.position.z = -10 - newCenter.z;
                this.car.rotation.y = Math.PI;

                this.car.traverse((child: any) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                this.scene.add(this.car);
                this.startAnimation();
            },
            () => { },
            (error: any) => {
                console.error('Error loading 3D model:', error);
                this.useRealModel = false;
                this.createFallbackCar();
                this.startAnimation();
            }
        );
    }

    private createFallbackCar(): void {
        // Your existing geometric car model
        this.car = new Group();

        const bodyMaterial = new MeshPhongMaterial({
            color: 0x8B0000,
            specular: 0x222222,
            shininess: 90,
            emissive: 0x110000,
            emissiveIntensity: 0.1
        });

        const chromeMaterial = new MeshStandardMaterial({
            color: 0xcccccc,
            metalness: 0.95,
            roughness: 0.05
        });

        // Lower body
        const lowerBodyGeo = new BoxGeometry(2.2, 0.7, 4.5);
        const lowerBody = new Mesh(lowerBodyGeo, bodyMaterial);
        lowerBody.position.y = 0.65;
        lowerBody.castShadow = true;
        this.car.add(lowerBody);

        // Cabin
        const cabinGeo = new BoxGeometry(2.0, 0.9, 3.0);
        const cabin = new Mesh(cabinGeo, bodyMaterial);
        cabin.position.set(0, 1.45, -0.2);
        cabin.castShadow = true;
        this.car.add(cabin);

        // Hood
        const hoodGeo = new BoxGeometry(2.1, 0.3, 1.6);
        const hood = new Mesh(hoodGeo, bodyMaterial);
        hood.position.set(0, 0.8, 2.7);
        hood.castShadow = true;
        this.car.add(hood);

        // Grille
        const grilleGeo = new BoxGeometry(1.6, 0.4, 0.1);
        const grille = new Mesh(grilleGeo, chromeMaterial);
        grille.position.set(0, 0.7, 3.6);
        this.car.add(grille);

        // Wheels
        const wheelGeo = new CylinderGeometry(0.45, 0.45, 0.35, 32);
        const tireMaterial = new MeshPhongMaterial({ color: 0x1a1a1a });

        const wheelPositions = [
            { x: -1.15, y: 0.45, z: 1.6 },
            { x: 1.15, y: 0.45, z: 1.6 },
            { x: -1.15, y: 0.45, z: -1.5 },
            { x: 1.15, y: 0.45, z: -1.5 }
        ];

        wheelPositions.forEach(pos => {
            const wheel = new Mesh(wheelGeo, tireMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos.x, pos.y, pos.z);
            wheel.castShadow = true;
            this.car.add(wheel);
        });

        // Headlights
        const headlightGeo = new BoxGeometry(0.4, 0.25, 0.15);
        const headlightMaterial = new MeshPhongMaterial({
            color: 0xffffee,
            emissive: 0xffffaa,
            emissiveIntensity: 0.8
        });

        const leftHeadlight = new Mesh(headlightGeo, headlightMaterial);
        leftHeadlight.position.set(-0.75, 0.75, 3.6);
        this.car.add(leftHeadlight);

        const rightHeadlight = new Mesh(headlightGeo, headlightMaterial);
        rightHeadlight.position.set(0.75, 0.75, 3.6);
        this.car.add(rightHeadlight);

        this.car.position.set(0, 0, -70);
        this.scene.add(this.car);
    }

    private addLights(): void {
        // Very bright ambient light for overall illumination
        const ambientLight = new AmbientLight(0xffffff, 2.5);
        this.scene.add(ambientLight);

        // Strong main directional light from front-top
        const mainLight = new DirectionalLight(0xffffff, 3.5);
        mainLight.position.set(5, 10, 15);
        mainLight.castShadow = true;
        mainLight.shadow.camera.left = -20;
        mainLight.shadow.camera.right = 20;
        mainLight.shadow.camera.top = 20;
        mainLight.shadow.camera.bottom = -20;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        this.scene.add(mainLight);

        // Fill light from the side
        const fillLight = new DirectionalLight(0xaabbff, 2.0);
        fillLight.position.set(-10, 8, 10);
        this.scene.add(fillLight);

        // Top spotlight
        const spotLight = new SpotLight(0xffffff, 3.0);
        spotLight.position.set(0, 15, 5);
        spotLight.angle = Math.PI / 4;
        spotLight.penumbra = 0.3;
        spotLight.castShadow = true;
        this.scene.add(spotLight);

        // Additional point lights for better coverage
        const pointLight1 = new PointLight(0x6688ff, 2.0, 80);
        pointLight1.position.set(-8, 5, 0);
        this.scene.add(pointLight1);

        const pointLight2 = new PointLight(0xff8866, 2.0, 80);
        pointLight2.position.set(8, 5, 0);
        this.scene.add(pointLight2);

        // Front light to illuminate the car face
        const frontLight = new DirectionalLight(0xffffff, 2.5);
        frontLight.position.set(0, 3, 20);
        this.scene.add(frontLight);
    }

    private startAnimation(): void {
        this.startTime = Date.now();
        this.animate();
    }

    private animate(): void {
        this.animationId = requestAnimationFrame(() => this.animate());

        const elapsed = Date.now() - this.startTime;
        const progress = Math.min(elapsed / this.animationDuration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

        if (!this.isAnimationComplete) {
            // --- Entrance Animation Phase ---
            this.camera.position.z = 18 - (8 * easeProgress); // From 18 to 10

            if (this.car && this.useRealModel) {
                // Animate from Z = -20 to Z = 0 (visual center)
                // Start Visual Z: -20
                // End Visual Z: 0
                // Formula: Start + (Distance * progress)
                // Since we initialized pos.z = -20 - carCenterOffset.z
                // We want final pos.z = -carCenterOffset.z
                // Difference is exactly +20 units.
                this.car.position.z = (-20 - this.carCenterOffset.z) + (20 * easeProgress);

                // Rotation
                this.car.rotation.y = Math.PI + (easeProgress * 0.3);
            }
        }

        // --- Interaction Phase Check ---
        if (progress >= 1 && !this.isAnimationComplete) {
            this.isAnimationComplete = true;
            this.canClickToProceed = true;
        }

        if (this.controls) {
            this.controls.update();

            // Stop rotation when car head points left (Camera at -X axis, angle ~ -Math.PI/2)
            // autoRotate is clockwise (decreasing angle).
            // range of getAzimuthalAngle is -PI to PI.
            if (this.controls.autoRotate) {
                const angle = this.controls.getAzimuthalAngle();
                // Check if we passed the -PI/2 mark (approx -1.57)
                // Since we start at 0 and go negative.
                if (angle <= -Math.PI / 2) {
                    this.controls.autoRotate = false;
                }
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    private onWindowResize(): void {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }


}
