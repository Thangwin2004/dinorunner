import { Container, Sprite, Graphics } from "pixi.js";
import { AVATAR_BOUNDS, LEFT_FACING_AVATARS } from "./avatarData";

export function getAvatarColors(url) {
  const lowercase = url.toLowerCase();

  // Primary skin/fur color for each of the 44 characters
  let skin = 0xffa726; // Default Orange
  let foot = null;

  if (lowercase.includes("laclac")) {
    skin = 0xf5a623; // Vibrant golden-tan (Stitch design)
  } else if (lowercase.includes("cat_lick1")) {
    skin = 0x9e7a61; // Brown cat
  } else if (lowercase.includes("duck")) {
    skin = 0xffffff; // White duck
    foot = 0xff9800; // Orange duck feet
  } else if (lowercase.includes("turtle")) {
    skin = 0x81c784; // Green turtle
  } else if (lowercase.includes("long")) {
    skin = 0xe53935; // Red dragon
  } else if (lowercase.includes("horse")) {
    skin = 0x795548; // Brown horse
  } else if (lowercase.includes("tiguawhite")) {
    skin = 0xe0e0e0; // White tiger
  } else if (lowercase.includes("husky")) {
    skin = 0x90a4ae; // Grey husky
  } else if (lowercase.includes("doremonk")) {
    skin = 0x29b6f6; // Blue Doraemon
  } else if (lowercase.includes("echxanh1")) {
    skin = 0x66bb6a; // Green frog
  } else if (lowercase.includes("nudaeng")) {
    skin = 0xffab91; // Peach skin
  } else if (lowercase.includes("hubcat")) {
    skin = 0xffb74d; // Orange cat
  } else if (lowercase.includes("unicorn")) {
    skin = 0xf8bbd0; // Pink unicorn
  } else if (lowercase.includes("zongbadou")) {
    skin = 0xffd54f; // Yellow dragon
  } else if (lowercase.includes("daulan")) {
    skin = 0xe53935; // Red lion
  } else if (lowercase.includes("banhtung")) {
    skin = 0x81c784; // Green sticky rice
  } else if (lowercase.includes("tiguayel")) {
    skin = 0xffb300; // Yellow tiger
  } else if (lowercase.includes("megachard")) {
    skin = 0xff7043; // Orange Megachard
  } else if (lowercase.includes("gigaboy")) {
    skin = 0x81c784; // Green boy
  } else if (lowercase.includes("cloudball")) {
    skin = 0xe0f7fa; // Light blue cloud
  } else if (lowercase.includes("culama")) {
    skin = 0xffecb3; // Cream llama
  } else if (lowercase.includes("poolpanda2")) {
    skin = 0xffffff; // White panda
  } else if (lowercase.includes("poolpanda")) {
    skin = 0xe0e0e0; // White/Grey panda
  } else if (lowercase.includes("trollvn")) {
    skin = 0xffffff; // White meme
  } else if (lowercase.includes("heothy")) {
    skin = 0xff8a80; // Pink pig
  } else if (lowercase.includes("zolype2")) {
    skin = 0xab47bc; // Purple bird
  } else if (lowercase.includes("zolype")) {
    skin = 0xffeb3b; // Yellow bird
  } else if (lowercase.includes("crick")) {
    skin = 0x81c784; // Green cricket
  } else if (lowercase.includes("penguine")) {
    skin = 0x263238; // Dark grey penguin
    foot = 0xffb300; // Orange penguin feet
  } else if (lowercase.includes("timao")) {
    skin = 0x90a4ae; // Grey mouse
  } else if (lowercase.includes("caocal")) {
    skin = 0xffa726; // Orange fox
  } else if (lowercase.includes("cowboy")) {
    skin = 0x8d6e63; // Brown cowboy
  } else if (lowercase.includes("ninjadog")) {
    skin = 0x212121; // Black ninja dog
  } else if (lowercase.includes("petrocat")) {
    skin = 0x78909c; // Grey cat
  } else if (lowercase.includes("richmonkey")) {
    skin = 0x8d6e63; // Brown monkey
  } else if (lowercase.includes("hazagi")) {
    skin = 0xffcc80; // Peach skin
  } else if (lowercase.includes("dogoin")) {
    skin = 0xa1887f; // Brown dog
  } else if (lowercase.includes("watermelon")) {
    skin = 0x4caf50; // Green watermelon
  } else if (lowercase.includes("timone")) {
    skin = 0x8d6e63; // Brown meerkat
  } else if (lowercase.includes("ronaldo")) {
    skin = 0xffcc80; // Peach skin
  } else if (lowercase.includes("hustmouse")) {
    skin = 0x90a4ae; // Grey mouse
  } else if (lowercase.includes("hitbear")) {
    skin = 0x8d6e63; // Brown bear
  } else if (lowercase.includes("echxanh2")) {
    skin = 0x4caf50; // Green frog
  } else if (lowercase.includes("cat_lick2")) {
    skin = 0x212121; // Black cat
  }

  return {
    head: skin,
    body: 0x795548, // Brown tribal vest
    sleeve: 0x8d6e63, // Light brown sleeves
    pants: 0x4e342e, // Dark brown pants
    foot: foot || 0x3e2723, // Very dark feet
  };
}

export function getAvatarCrop(url, maskRadius, partType = "head") {
  const name = url.replace(".webp", "").split("_").pop();
  const bounds = AVATAR_BOUNDS[name];
  if (!bounds) return { scale: 1.0, x: 0, y: 0 };

  const scale = (maskRadius * 2 * 1.1) / bounds.boundWidth;
  const headCenterX = bounds.minX + bounds.boundWidth / 2.0;

  let targetCenterX = headCenterX;
  let targetCenterY = bounds.minY + bounds.boundWidth / 2.0;

  if (partType === "body") {
    targetCenterY =
      bounds.minY +
      bounds.boundWidth +
      (bounds.boundHeight - bounds.boundWidth) * 0.3;
  } else if (partType === "arm") {
    targetCenterX = bounds.minX + bounds.boundWidth * 0.35; // closer to center to hit solid texture
    targetCenterY =
      bounds.minY +
      bounds.boundWidth +
      (bounds.boundHeight - bounds.boundWidth) * 0.3;
  } else if (partType === "leg") {
    targetCenterX = bounds.minX + bounds.boundWidth * 0.45; // closer to center
    targetCenterY = bounds.maxY - bounds.boundHeight * 0.25; // hit the pants/belly, avoid the bottom gap
  }

  const imgWidth = bounds.height;
  const distX = targetCenterX - imgWidth / 2.0;
  const distY = targetCenterY - bounds.height / 2.0;

  return {
    scale,
    x: -distX * scale,
    y: -distY * scale,
  };
}

export function getAvatarName(url) {
  if (!url) return "001_avatar_laclac";
  return url.replace(".webp", "").split("/").pop();
}

export function createSkeletalPart(tex, partType, url) {
  const partContainer = new Container();

  let maskShape = new Graphics();
  let border = new Graphics();

  const sp = new Sprite(tex);
  sp.anchor.set(0.5);
  const isLeftFacing = LEFT_FACING_AVATARS.some((n) => url.includes(n));

  const crop = getAvatarCrop(url, 24, partType);
  sp.scale.set(crop.scale);
  if (isLeftFacing) {
    sp.scale.x = -Math.abs(sp.scale.x);
    sp.x = -crop.x;
  } else {
    sp.x = crop.x;
  }

  // Offset sprite so the target pixel aligns with the center of the mask
  let offsetY = 0;
  if (partType === "body") offsetY = 4;
  if (partType === "arm") offsetY = 13;
  if (partType === "leg") offsetY = 18;
  sp.y = crop.y + offsetY;

  if (partType === "head") {
    maskShape.circle(0, 0, 24).fill(0xffffff);
    border.circle(0, 0, 24).stroke({ width: 3, color: 0xffffff, alpha: 0.9 });
  } else if (partType === "body") {
    maskShape.roundRect(-14, -6, 28, 20, 8).fill(0xffffff);
    border
      .roundRect(-14, -6, 28, 20, 8)
      .stroke({ width: 3.5, color: 0x1a1a2e, alpha: 0.9 });
  } else if (partType === "arm") {
    maskShape.roundRect(-7, 0, 14, 26, 7).circle(0, 26, 8).fill(0xffffff);
    border
      .roundRect(-7, 0, 14, 26, 7)
      .stroke({ width: 2.5, color: 0x1a1a2e, alpha: 0.9 });
    border.circle(0, 26, 8).stroke({ width: 2.5, color: 0x1a1a2e, alpha: 0.9 });
  } else if (partType === "leg") {
    maskShape
      .roundRect(-9, 0, 18, 30, 9)
      .roundRect(-9, 24, 22, 12, 6)
      .fill(0xffffff);
    border
      .roundRect(-9, 0, 18, 30, 9)
      .stroke({ width: 3, color: 0x1a1a2e, alpha: 0.9 });
    border
      .roundRect(-9, 24, 22, 12, 6)
      .stroke({ width: 3, color: 0x1a1a2e, alpha: 0.9 });
  }

  sp.mask = maskShape;
  partContainer.addChild(sp);
  partContainer.addChild(maskShape);
  partContainer.addChild(border);

  return partContainer;
}

export function createFull2DSprite(tex, url, targetHeight = 110) {
  const sp = new Sprite(tex);
  sp.anchor.set(0.5, 1);
  const isLeftFacing = LEFT_FACING_AVATARS.some((n) => url.includes(n));
  const texHeight = tex.height > 0 ? tex.height : 256;
  const baseScale = targetHeight / texHeight;
  const scaleX = isLeftFacing ? -baseScale : baseScale;
  const scaleY = baseScale;
  sp.scale.set(scaleX, scaleY);
  sp.baseScaleX = scaleX;
  sp.baseScaleY = scaleY;

  // Trim bottom transparent margin so character feet sit firmly on the dirt road
  const name = url.replace(".webp", "").split("_").pop();
  const bounds = AVATAR_BOUNDS[name];
  if (bounds) {
    const bottomPadRatio = (bounds.height - bounds.maxY) / bounds.height;
    sp.y = bottomPadRatio * targetHeight;
  }
  return sp;
}

// A purpose-built runner rig. Each limb is a stable vector object rather than
// a cropped avatar image, so gameplay can animate an actual run/jump/slide.
export function createRunnerRig() {
  const rig = new Container();
  const outline = 0x16413d;
  const skin = 0x35c98c;
  const belly = 0xbef2c6;
  const spine = 0x138c68;

  const makeLimb = (color, width, height) => {
    const limb = new Container();
    limb.addChild(
      new Graphics()
        .roundRect(-width / 2, 0, width, height, width / 2)
        .fill(color)
        .stroke({ color: outline, width: 3 }),
    );
    limb.addChild(
      new Graphics()
        .ellipse(width * 0.25, height - 2, width * 0.78, width * 0.43)
        .fill(color)
        .stroke({ color: outline, width: 3 }),
    );
    return limb;
  };

  rig.tail = new Container();
  rig.backArm = makeLimb(0x259d75, 11, 21);
  rig.backLeg = makeLimb(spine, 18, 37);
  rig.body = new Container();
  rig.frontLeg = makeLimb(skin, 18, 37);
  rig.frontArm = makeLimb(skin, 11, 21);
  rig.head = new Container();

  rig.backArm.position.set(13, -55);
  rig.backLeg.position.set(-10, -28);
  rig.frontLeg.position.set(11, -28);
  rig.frontArm.position.set(28, -54);
  rig.tail.position.set(-31, -47);

  rig.tail.addChild(
    new Graphics()
      .moveTo(0, 0)
      .quadraticCurveTo(-35, 2, -58, 24)
      .quadraticCurveTo(-28, 23, -4, 13)
      .closePath()
      .fill(spine)
      .stroke({ color: outline, width: 4, join: "round" }),
  );

  rig.body.addChild(
    new Graphics()
      .ellipse(0, -47, 39, 23)
      .fill(skin)
      .stroke({ color: outline, width: 4 }),
  );
  rig.body.addChild(new Graphics().ellipse(11, -43, 22, 15).fill(belly));
  rig.body.addChild(
    new Graphics()
      .poly([-23, -61, -14, -78, -4, -62], true)
      .poly([-5, -64, 5, -82, 14, -63], true)
      .poly([15, -61, 24, -75, 31, -56], true)
      .fill(spine)
      .stroke({ color: outline, width: 2.5, join: "round" }),
  );

  // A clean side profile gives an immediate, friendly forward direction.
  rig.head.addChild(
    new Graphics()
      .ellipse(5, 0, 31, 27)
      .fill(skin)
      .stroke({ color: outline, width: 4 }),
  );
  rig.head.addChild(
    new Graphics()
      .ellipse(29, 7, 19, 14)
      .fill(belly)
      .stroke({ color: outline, width: 3 }),
  );
  rig.head.addChild(
    new Graphics()
      .circle(14, -8, 10)
      .fill(0xffffff)
      .stroke({ color: outline, width: 2.5 }),
  );
  rig.head.addChild(new Graphics().circle(16, -7, 4.4).fill(outline));
  rig.head.addChild(new Graphics().circle(38, 4, 2.5).fill(outline));
  rig.head.addChild(
    new Graphics()
      .arc(24, 13, 10, 0.15, Math.PI - 0.2)
      .stroke({ color: outline, width: 2.5, cap: "round" }),
  );
  rig.head.addChild(
    new Graphics()
      .poly([-18, -17, -8, -33, 1, -20], true)
      .fill(spine)
      .stroke({ color: outline, width: 2.5, join: "round" }),
  );
  rig.head.position.set(29, -71);

  rig.addChild(
    rig.tail,
    rig.backArm,
    rig.backLeg,
    rig.body,
    rig.frontLeg,
    rig.head,
    rig.frontArm,
  );
  return rig;
}

export function animateRunnerRig(rig, phase, action = "run") {
  if (!rig) return;
  rig.position.set(0, 0);
  rig.rotation = 0;
  rig.scale.set(1);
  rig.body.position.set(0, 0);
  rig.body.rotation = 0;
  rig.head.position.set(29, -71);
  rig.head.rotation = 0;
  rig.tail.position.set(-31, -47);
  rig.tail.rotation = 0;
  rig.backArm.position.set(13, -55);
  rig.frontArm.position.set(28, -54);
  rig.backLeg.position.set(-10, -28);
  rig.frontLeg.position.set(11, -28);
  rig.backArm.rotation = 0;
  rig.frontArm.rotation = 0;
  rig.backLeg.rotation = 0;
  rig.frontLeg.rotation = 0;

  const swing = Math.sin(phase);
  const bounce = Math.abs(swing);
  if (action === "jump") {
    rig.rotation = -0.1;
    rig.position.set(0, -4);
    rig.scale.set(1.06, 0.96);
    rig.backArm.rotation = -2.25;
    rig.frontArm.rotation = -1.72;
    rig.backLeg.rotation = -0.95;
    rig.frontLeg.rotation = -0.48;
    rig.head.rotation = 0.06;
    rig.tail.rotation = 0.28;
    return;
  }
  if (action === "slide") {
    // Low duck for passing under obstacles. Keep one coherent silhouette and
    // avoid rotating individual body parts into a broken, flattened pose.
    rig.position.set(4, 1);
    rig.scale.set(1.06, 0.7);
    rig.head.rotation = -0.07;
    rig.backArm.rotation = 0.42;
    rig.frontArm.rotation = 0.5;
    rig.backLeg.rotation = -0.18;
    rig.frontLeg.rotation = 0.18;
    rig.tail.rotation = -0.12;
    return;
  }

  rig.rotation = 0;
  rig.position.set(0, bounce * 3);
  rig.scale.set(1 + bounce * 0.025, 1 - bounce * 0.045);
  rig.backArm.rotation = -swing * 0.78;
  rig.frontArm.rotation = swing * 0.78;
  rig.backLeg.rotation = swing * 0.83;
  rig.frontLeg.rotation = -swing * 0.83;
  rig.body.rotation = swing * 0.045;
  rig.head.rotation = -swing * 0.035;
}

export function updateSkeletalRigTexture(tex, url, rig) {
  if (rig.fullCharSprite) {
    rig.fullCharSprite.texture = tex;
    const isLeftFacing = LEFT_FACING_AVATARS.some((n) => url.includes(n));
    const texHeight = tex.height > 0 ? tex.height : 256;
    const baseScale = 110 / texHeight;
    rig.fullCharSprite.baseScaleX = isLeftFacing ? -baseScale : baseScale;
    rig.fullCharSprite.baseScaleY = baseScale;
    rig.fullCharSprite.scale.set(
      rig.fullCharSprite.baseScaleX,
      rig.fullCharSprite.baseScaleY,
    );

    const name = url.replace(".webp", "").split("_").pop();
    const bounds = AVATAR_BOUNDS[name];
    if (bounds) {
      const bottomPadRatio = (bounds.height - bounds.maxY) / bounds.height;
      rig.fullCharSprite.y = bottomPadRatio * 110;
    }
  }

  const parts = [
    { container: rig.head, type: "head" },
    { container: rig.body, type: "body" },
    { container: rig.leftArm, type: "arm" },
    { container: rig.rightArm, type: "arm" },
    { container: rig.leftLeg, type: "leg" },
    { container: rig.rightLeg, type: "leg" },
  ];

  const isLeftFacing = LEFT_FACING_AVATARS.some((n) => url.includes(n));

  parts.forEach(({ container, type }) => {
    if (!container || !container.children[0]) return;
    const sp = container.children.find((c) => c instanceof Sprite);
    if (sp) {
      sp.texture = tex;
      const crop = getAvatarCrop(url, 24, type);
      sp.scale.set(crop.scale);
      if (isLeftFacing) {
        sp.scale.x = -Math.abs(sp.scale.x);
        sp.x = -crop.x;
      } else {
        sp.scale.x = Math.abs(sp.scale.x);
        sp.x = crop.x;
      }

      let offsetY = 0;
      if (type === "body") offsetY = 4;
      if (type === "arm") offsetY = 13;
      if (type === "leg") offsetY = 18;
      sp.y = crop.y + offsetY;
    }
  });
}

export function updatePlayerLeg(
  legContainer,
  hipX,
  hipY,
  phase,
  isJumping,
  isDucking,
) {
  legContainer.position.set(hipX, hipY);
  let angle = 0;
  if (isJumping) angle = -0.5;
  else if (isDucking) angle = -1.2;
  else angle = Math.cos(phase) * 0.7;
  legContainer.rotation = angle;
}

export function updatePlayerArm(
  armContainer,
  shoulderX,
  shoulderY,
  phase,
  isJumping,
  isDucking,
) {
  armContainer.position.set(shoulderX, shoulderY);
  let angle = 0;
  if (isJumping) angle = -2.2;
  else if (isDucking) angle = 0.8;
  else angle = -Math.cos(phase) * 0.8;
  armContainer.rotation = angle;
}

export function updatePlayerBody(bodyContainer, yOffset = -36) {
  bodyContainer.position.set(0, yOffset);
  bodyContainer.rotation = 0;
}
