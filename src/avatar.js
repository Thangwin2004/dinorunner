import { Container, Sprite, Graphics } from "pixi.js";
import { AVATAR_BOUNDS, LEFT_FACING_AVATARS } from "./avatarData";

export function getAvatarColors(url) {
  const lowercase = url.toLowerCase();

  // Primary skin/fur color for each of the 44 characters
  let skin = 0xffa726; // Default Orange
  let foot = null;

  if (lowercase.includes("laclac")) {
    skin = 0xe5a65d; // Peanut beige/yellow
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
    body: skin,
    pants: skin,
    sleeve: skin,
    foot: foot || skin,
  };
}

export function getAvatarCrop(url, maskRadius) {
  const name = url.replace(".png", "").split("_").pop();
  const bounds = AVATAR_BOUNDS[name];
  if (!bounds) return { scale: 1.0, x: 0, y: 0 };

  // Assume head is roughly square (size bounds.boundWidth) at the top of the character box (bounds.minY)
  const scale = (maskRadius * 2 * 1.1) / bounds.boundWidth;
  const headCenterX = bounds.minX + bounds.boundWidth / 2.0;
  const headCenterY = bounds.minY + bounds.boundWidth / 2.0;

  // Calculate pixel offsets relative to texture center (image width equals height)
  const imgWidth = bounds.height;
  const distX = headCenterX - imgWidth / 2.0;
  const distY = headCenterY - bounds.height / 2.0;

  return {
    scale,
    x: -distX * scale,
    y: -distY * scale,
  };
}

export function createSkeletalPart(tex, partType, url) {
  const partContainer = new Container();
  const colors = getAvatarColors(url);

  let maskShape = new Graphics();
  let border = new Graphics();

  if (partType === "head") {
    const sp = new Sprite(tex);
    sp.anchor.set(0.5);
    const isLeftFacing = LEFT_FACING_AVATARS.some((n) => url.includes(n));
    sp.scale.x = isLeftFacing ? -Math.abs(sp.scale.x) : Math.abs(sp.scale.x);

    const crop = getAvatarCrop(url, 24); // 24px head radius
    sp.scale.set(crop.scale);
    sp.x = isLeftFacing ? -crop.x : crop.x;
    sp.y = crop.y;

    maskShape.circle(0, 0, 24).fill(0xffffff);
    border.circle(0, 0, 24).stroke({ width: 3, color: 0xffea00 });

    sp.mask = maskShape;
    partContainer.addChild(sp);
    partContainer.addChild(maskShape);
  } else if (partType === "body") {
    border
      .roundRect(-16, -20, 32, 28, 12)
      .fill(colors.body)
      .stroke({ width: 3.5, color: 0x1a1a2e });
  } else if (partType === "arm") {
    border
      .roundRect(-6, 0, 12, 24, 6)
      .fill(colors.sleeve)
      .stroke({ width: 2.5, color: 0x1a1a2e });
    border
      .circle(0, 24, 7)
      .fill(colors.head)
      .stroke({ width: 2.5, color: 0x1a1a2e });
  } else if (partType === "leg") {
    border
      .roundRect(-8, 0, 16, 28, 8)
      .fill(colors.pants)
      .stroke({ width: 3, color: 0x1a1a2e });
    border
      .roundRect(-8, 22, 20, 10, 5)
      .fill(colors.foot)
      .stroke({ width: 3, color: 0x1a1a2e });
  }

  partContainer.addChild(border);
  return partContainer;
}

export function updateSkeletalRigTexture(tex, url, rig) {
  // Update the head sprite
  if (rig.head && rig.head.children[0]) {
    const sp = rig.head.children[0];
    sp.texture = tex;
    const crop = getAvatarCrop(url, 24); // 24px head radius
    sp.scale.set(crop.scale);
    const isLeftFacing = LEFT_FACING_AVATARS.some((n) => url.includes(n));
    sp.scale.x = isLeftFacing ? -Math.abs(sp.scale.x) : Math.abs(sp.scale.x);
    sp.x = isLeftFacing ? -crop.x : crop.x;
    sp.y = crop.y;
  }

  const colors = getAvatarColors(url);

  // Redraw body Graphics
  if (rig.body) {
    const border = rig.body.children.find((c) => c instanceof Graphics);
    if (border) {
      border.clear();
      border
        .roundRect(-16, -20, 32, 28, 12)
        .fill(colors.body)
        .stroke({ width: 3.5, color: 0x1a1a2e });
    }
  }

  // Redraw arms Graphics
  [rig.leftArm, rig.rightArm].forEach((arm) => {
    if (arm) {
      const border = arm.children.find((c) => c instanceof Graphics);
      if (border) {
        border.clear();
        border
          .roundRect(-6, 0, 12, 24, 6)
          .fill(colors.sleeve)
          .stroke({ width: 2.5, color: 0x1a1a2e });
        border
          .circle(0, 24, 7)
          .fill(colors.head)
          .stroke({ width: 2.5, color: 0x1a1a2e });
      }
    }
  });

  // Redraw legs Graphics
  [rig.leftLeg, rig.rightLeg].forEach((leg) => {
    if (leg) {
      const border = leg.children.find((c) => c instanceof Graphics);
      if (border) {
        border.clear();
        border
          .roundRect(-8, 0, 16, 28, 8)
          .fill(colors.pants)
          .stroke({ width: 3, color: 0x1a1a2e });
        border
          .roundRect(-8, 22, 20, 10, 5)
          .fill(colors.foot)
          .stroke({ width: 3, color: 0x1a1a2e });
      }
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
