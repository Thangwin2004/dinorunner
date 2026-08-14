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
