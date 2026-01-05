import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

/**
 * Particle System Component
 * High-performance 3D sphere using InstancedMesh
 * Features:
 * - 2000 particles for smooth 60fps performance
 * - Mouse repulsion physics
 * - Dynamic color states (Idle/Listening/Speaking)
 */
function ParticleSystem({ mousePosition, state }) {
    const meshRef = useRef();
    const particleCount = 2000;

    // Achievement Color Palette for sphere states
    const colors = {
        idle: new THREE.Color("#E67E22"),      // Burnt Orange - Primary
        listening: new THREE.Color("#FF6B35"), // Bright Orange - Active listening
        speaking: new THREE.Color("#FFFFFF")   // Pure White - Speaking
    };

    // Initialize particle positions and velocities
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const radius = 1.5 + Math.random() * 0.5;

            temp.push({
                position: new THREE.Vector3(
                    radius * Math.sin(phi) * Math.cos(theta),
                    radius * Math.sin(phi) * Math.sin(theta),
                    radius * Math.cos(phi)
                ),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02
                ),
                originalPosition: new THREE.Vector3(),
                index: i // Store index for slight offset
            });
            temp[i].originalPosition.copy(temp[i].position);
        }
        return temp;
    }, []);

    // Animation loop
    useFrame((frameState, delta) => {
        if (!meshRef.current) return;

        const time = frameState.clock.getElapsedTime();
        const dummy = new THREE.Object3D();
        const currentColor = colors[state] || colors.idle;

        // Premium rotation + shape-morphing effect for BOTH listening and speaking
        let globalRotationY = 0;
        let disperseAmount = 0;

        if (state === "listening" || state === "speaking") {
            // Continuous 360-degree rotation for BOTH states
            const rotationSpeed = state === "speaking" ? 1.2 : 0.6; // Faster when speaking
            globalRotationY = time * rotationSpeed;

            // Shape morphing: Different intensity for listening vs speaking
            const morphSpeed = state === "speaking" ? 1.5 : 0.8;
            const morphCycle = Math.sin(time * morphSpeed);

            // Speaking has more dramatic morphing, listening is subtle
            const morphIntensity = state === "speaking" ? 1.0 : 0.3;
            disperseAmount = Math.abs(morphCycle) * morphIntensity;
        }

        particles.forEach((particle, i) => {
            // Mouse repulsion effect (ONLY in idle state - disabled during interview)
            if (mousePosition && state === "idle") {
                const mouseVec = new THREE.Vector3(
                    mousePosition.x * 5,
                    -mousePosition.y * 5,
                    0
                );
                const distance = particle.position.distanceTo(mouseVec);

                if (distance < 2) {
                    const repulsion = particle.position.clone().sub(mouseVec).normalize();
                    particle.velocity.add(repulsion.multiplyScalar(0.05));
                }
            }

            // State-based behavior - SYNCHRONIZED
            switch (state) {
                case "listening":
                    // PREMIUM EFFECT: Rotation + Shape Morphing (Subtle for listening)

                    // 1. Apply rotation around Y-axis to original position
                    const rotatedPosListening = particle.originalPosition.clone();
                    const rotMatrixListening = new THREE.Matrix4();
                    rotMatrixListening.makeRotationY(globalRotationY);
                    rotatedPosListening.applyMatrix4(rotMatrixListening);

                    // 2. Shape morphing: subtle dispersion for listening
                    const disperseDirListening = rotatedPosListening.clone().normalize();
                    const maxDispersionListening = 1.5; // Less than speaking

                    //  Create 3-phase morphing
                    let targetDispersionListening;
                    if (disperseAmount < 0.33) {
                        targetDispersionListening = disperseAmount * 3 * 0.5;
                    } else if (disperseAmount < 0.66) {
                        targetDispersionListening = 0.5 + ((disperseAmount - 0.33) * 3 * 0.8);
                    } else {
                        targetDispersionListening = 1.3 - ((disperseAmount - 0.66) * 3 * 1.3);
                    }

                    const disperseOffsetListening = disperseDirListening.clone().multiplyScalar(targetDispersionListening * maxDispersionListening);
                    const targetPosListening = rotatedPosListening.clone().add(disperseOffsetListening);

                    // 3. Subtle pulsing for listening
                    const listenPulse = Math.sin(time * 15) * 0.06;
                    const pulseDirListening = targetPosListening.clone().normalize();
                    targetPosListening.add(pulseDirListening.multiplyScalar(listenPulse));

                    // 4. Smooth transition
                    const moveForceListening = targetPosListening.clone()
                        .sub(particle.position)
                        .multiplyScalar(0.1);
                    particle.velocity.add(moveForceListening);

                    // 5. Organic movement
                    const organicXL = Math.sin(time * 3 + i * 0.5) * 0.02;
                    const organicYL = Math.cos(time * 3 + i * 0.5) * 0.02;
                    const organicZL = Math.sin(time * 4 + i * 0.3) * 0.02;
                    particle.velocity.add(new THREE.Vector3(organicXL, organicYL, organicZL));
                    break;

                case "speaking":
                    // PREMIUM EFFECT: Rotation + Shape Morphing (3-Phase Cycle)

                    // 1. Apply rotation around Y-axis to original position
                    const rotatedPosition = particle.originalPosition.clone();
                    const rotationMatrix = new THREE.Matrix4();
                    rotationMatrix.makeRotationY(globalRotationY);
                    rotatedPosition.applyMatrix4(rotationMatrix);

                    // 2. Shape morphing: disperse particles in 3 phases
                    const disperseDir = rotatedPosition.clone().normalize();
                    const maxDispersion = 2.5; // Maximum explosion distance

                    // Create 3-phase morphing effect based on disperseAmount (0 to 1)
                    let targetDispersion;
                    if (disperseAmount < 0.33) {
                        // Phase 1: Compact sphere (slight expansion)
                        targetDispersion = disperseAmount * 3 * 0.5; // 0 to 0.5
                    } else if (disperseAmount < 0.66) {
                        // Phase 2: Dispersing particles
                        targetDispersion = 0.5 + ((disperseAmount - 0.33) * 3 * 0.8); // 0.5 to 1.3
                    } else {
                        // Phase 3: Maximum explosion then contract back
                        targetDispersion = 1.3 - ((disperseAmount - 0.66) * 3 * 1.3); // 1.3 back to 0
                    }

                    const disperseOffset = disperseDir.clone().multiplyScalar(targetDispersion * maxDispersion);
                    const targetPosition = rotatedPosition.clone().add(disperseOffset);

                    // 3. Voice-reactive pulsing overlay
                    const voicePulse = Math.sin(time * 15) * 0.12;
                    const pulseDir = targetPosition.clone().normalize();
                    targetPosition.add(pulseDir.multiplyScalar(voicePulse));

                    // 4. Smooth transition to target position
                    const moveForce = targetPosition.clone()
                        .sub(particle.position)
                        .multiplyScalar(0.1); // Smooth interpolation
                    particle.velocity.add(moveForce);

                    // 5. Add organic movement variation for natural effect
                    const organicX = Math.sin(time * 3 + i * 0.5) * 0.02;
                    const organicY = Math.cos(time * 3 + i * 0.5) * 0.02;
                    const organicZ = Math.sin(time * 4 + i * 0.3) * 0.02;
                    particle.velocity.add(new THREE.Vector3(organicX, organicY, organicZ));
                    break;

                default:
                    // Idle: smooth return to original position
                    const returnForce = particle.originalPosition.clone()
                        .sub(particle.position)
                        .multiplyScalar(0.03);
                    particle.velocity.add(returnForce);
            }

            // Apply velocity with damping
            particle.position.add(particle.velocity);
            particle.velocity.multiplyScalar(0.94); // Consistent damping for cohesion


            // Update instance matrix
            dummy.position.copy(particle.position);
            dummy.rotation.set(time + i, time + i * 0.5, 0);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
            meshRef.current.setColorAt(i, currentColor);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) {
            meshRef.current.instanceColor.needsUpdate = true;
        }
    });

    return (
        <instancedMesh ref={meshRef} args={[null, null, particleCount]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial
                emissive={colors[state] || colors.idle}
                emissiveIntensity={state === "speaking" ? 0.9 : state === "listening" ? 0.7 : 0.5}
                transparent
                opacity={state === "speaking" ? 0.95 : 0.8}
            />
        </instancedMesh>
    );
}

/**
 * Main Perplexity Sphere Component
 */
export default function PerplexitySphere({ state = "idle" }) {
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (event) => {
            setMousePosition({
                x: (event.clientX / window.innerWidth) * 2 - 1,
                y: (event.clientY / window.innerHeight) * 2 - 1
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div style={{
            width: "100%",
            height: "100vh",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 0,
            pointerEvents: "none"
        }}>
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <ParticleSystem mousePosition={mousePosition} state={state} />
            </Canvas>
        </div>
    );
}
