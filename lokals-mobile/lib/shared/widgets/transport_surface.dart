import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import 'app_card.dart';

class TransportHeroBanner extends StatelessWidget {
  const TransportHeroBanner({
    super.key,
    required this.title,
    required this.subtitle,
    this.icon = Icons.alt_route_rounded,
    this.colors = const [AppColors.primaryPurple, AppColors.deepPurple],
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final List<Color> colors;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: colors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(28),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  subtitle,
                  style: const TextStyle(color: Colors.white70, height: 1.4),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.14),
              borderRadius: BorderRadius.circular(18),
            ),
            child: Icon(icon, color: Colors.white, size: 26),
          ),
        ],
      ),
    );
  }
}

class TransportSegmentTabs extends StatelessWidget {
  const TransportSegmentTabs({
    super.key,
    required this.items,
    required this.value,
    required this.onChanged,
  });

  final List<({String value, String label})> items;
  final String value;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.neutralSoftAlt,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        children: items.map((item) {
          final isSelected = item.value == value;
          return Expanded(
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            curve: Curves.easeOut,
            decoration: BoxDecoration(
              color: isSelected ? AppColors.primaryPurple : Colors.transparent,
              borderRadius: BorderRadius.circular(999),
              boxShadow: isSelected
                  ? [
                      BoxShadow(
                        color: AppColors.primaryPurple.withValues(alpha: 0.24),
                        blurRadius: 16,
                        offset: const Offset(0, 8),
                      ),
                    ]
                  : null,
            ),
            child: InkWell(
              borderRadius: BorderRadius.circular(999),
              onTap: () => onChanged(item.value),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 10),
                child: Text(
                  item.label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: isSelected ? Colors.white : AppColors.deepCharcoal,
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ),
          ),
          );
        }).toList(),
      ),
    );
  }
}

class TransportPanel extends StatelessWidget {
  const TransportPanel({
    super.key,
    required this.title,
    required this.subtitle,
    required this.child,
    this.trailing,
  });

  final String title;
  final String subtitle;
  final Widget child;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      subtitle,
                      style: const TextStyle(color: AppColors.mutedText),
                    ),
                  ],
                ),
              ),
              if (trailing != null) ...[const SizedBox(width: 12), trailing!],
            ],
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }
}

class TransportMiniStat extends StatelessWidget {
  const TransportMiniStat({
    super.key,
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.neutralSoftAlt,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.mutedText,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
          ),
        ],
      ),
    );
  }
}

class TransportFloatingIconButton extends StatelessWidget {
  const TransportFloatingIconButton({
    super.key,
    required this.icon,
    required this.onPressed,
    this.badge,
    this.backgroundColor = Colors.white,
    this.foregroundColor = AppColors.deepCharcoal,
  });

  final IconData icon;
  final VoidCallback onPressed;
  final String? badge;
  final Color backgroundColor;
  final Color foregroundColor;

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: onPressed,
            child: Ink(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: backgroundColor.withValues(alpha: 0.92),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withValues(alpha: 0.72)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 22,
                    offset: const Offset(0, 12),
                  ),
                ],
              ),
              child: Icon(icon, color: foregroundColor, size: 19),
            ),
          ),
        ),
        if (badge != null)
          Positioned(
            right: -2,
            top: -2,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
              decoration: BoxDecoration(
                color: AppColors.danger,
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                badge!,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
      ],
    );
  }
}

class TransportProfileShortcut extends StatelessWidget {
  const TransportProfileShortcut({
    super.key,
    required this.label,
    required this.onPressed,
    this.backgroundColor = Colors.white,
    this.foregroundColor = AppColors.primaryPurple,
  });

  final String label;
  final VoidCallback onPressed;
  final Color backgroundColor;
  final Color foregroundColor;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onPressed,
        child: Ink(
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: backgroundColor.withValues(alpha: 0.92),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withValues(alpha: 0.72)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 22,
                offset: const Offset(0, 12),
              ),
            ],
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                color: foregroundColor,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class TransportFloatingHeader extends StatelessWidget {
  const TransportFloatingHeader({
    super.key,
    required this.title,
    required this.subtitle,
    required this.onBack,
    this.trailing,
  });

  final String title;
  final String subtitle;
  final VoidCallback onBack;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        TransportFloatingIconButton(
          icon: Icons.arrow_back_ios_new_rounded,
          onPressed: onBack,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: ClipRRect(
            borderRadius: BorderRadius.circular(18),
            child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.78),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: Colors.white.withValues(alpha: 0.7)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 26,
                  offset: const Offset(0, 14),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.deepCharcoal,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(
                    color: AppColors.mutedText,
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            ),
          ),
        ),
        if (trailing != null) ...[const SizedBox(width: 12), trailing!],
      ],
    );
  }
}

class TransportRouteCard extends StatelessWidget {
  const TransportRouteCard({
    super.key,
    required this.pickupController,
    required this.destinationController,
    required this.pickupLabel,
    required this.destinationLabel,
    required this.quickChips,
    this.onAddStop,
  });

  final TextEditingController pickupController;
  final TextEditingController destinationController;
  final String pickupLabel;
  final String destinationLabel;
  final List<Widget> quickChips;
  final VoidCallback? onAddStop;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.88),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.white.withValues(alpha: 0.72)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 28,
            offset: const Offset(0, 16),
          ),
        ],
      ),
      child: Column(
        children: [
          _TransportFieldRow(
            label: pickupLabel,
            controller: pickupController,
            iconColor: AppColors.lokalsGreen,
            icon: Icons.circle,
          ),
          const SizedBox(height: 10),
          _TransportFieldRow(
            label: destinationLabel,
            controller: destinationController,
            iconColor: AppColors.danger,
            icon: Icons.location_on_rounded,
            trailing: onAddStop == null
                ? null
                : TransportFloatingIconButton(
                    icon: Icons.add_rounded,
                    onPressed: onAddStop!,
                    backgroundColor: AppColors.neutralSoftAlt,
                    foregroundColor: AppColors.primaryPurple,
                  ),
          ),
          if (quickChips.isNotEmpty) ...[
            const SizedBox(height: 12),
            SizedBox(
              height: 34,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                itemBuilder: (context, index) => quickChips[index],
                separatorBuilder: (_, _) => const SizedBox(width: 8),
                itemCount: quickChips.length,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class TransportDraggableBottomSheet extends StatelessWidget {
  const TransportDraggableBottomSheet({
    super.key,
    required this.childBuilder,
    this.initialChildSize = 0.54,
    this.minChildSize = 0.42,
    this.maxChildSize = 0.86,
  });

  final Widget Function(BuildContext context, ScrollController scrollController)
  childBuilder;
  final double initialChildSize;
  final double minChildSize;
  final double maxChildSize;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.bottomCenter,
      child: DraggableScrollableSheet(
        expand: false,
        snap: true,
        minChildSize: minChildSize,
        initialChildSize: initialChildSize,
        maxChildSize: maxChildSize,
        builder: (context, scrollController) {
          return Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(34)),
              boxShadow: [
                BoxShadow(
                  color: Color(0x22000000),
                  blurRadius: 34,
                  offset: Offset(0, -12),
                ),
              ],
            ),
            child: SafeArea(
              top: false,
              bottom: true,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(18, 10, 18, 12),
                child: childBuilder(context, scrollController),
              ),
            ),
          );
        },
      ),
    );
  }
}

class TransportBottomSheetCard extends StatelessWidget {
  const TransportBottomSheetCard({
    super.key,
    required this.child,
    this.maxHeight,
  });

  final Widget child;
  final double? maxHeight;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(
        maxHeight: maxHeight ?? MediaQuery.of(context).size.height * 0.54,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        boxShadow: [
          BoxShadow(
            color: Color(0x16000000),
            blurRadius: 24,
            offset: Offset(0, -8),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        bottom: true,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 12, 18, 12),
          child: child,
        ),
      ),
    );
  }
}

class TransportOptionCard extends StatelessWidget {
  const TransportOptionCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.price,
    required this.icon,
    required this.isSelected,
    required this.onTap,
    this.accentColor = AppColors.primaryPurple,
  });

  final String title;
  final String subtitle;
  final String price;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;
  final Color accentColor;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(22),
        onTap: onTap,
        child: Ink(
          width: 112,
          height: 96,
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: isSelected
                ? accentColor.withValues(alpha: 0.1)
                : AppColors.neutralSoftAlt,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(
              color: isSelected ? accentColor : Colors.transparent,
              width: 1.4,
            ),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: accentColor.withValues(alpha: 0.18),
                      blurRadius: 18,
                      offset: const Offset(0, 10),
                    ),
                  ]
                : null,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 30,
                    height: 30,
                    decoration: BoxDecoration(
                      color: isSelected
                          ? Colors.white
                          : Colors.white.withValues(alpha: 0.82),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(icon, size: 17, color: accentColor),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      price,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      textAlign: TextAlign.right,
                      style: TextStyle(
                        color: accentColor,
                        fontWeight: FontWeight.w800,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 5),
              Text(
                title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontWeight: FontWeight.w800,
                  fontSize: 12,
                  color: AppColors.deepCharcoal,
                ),
              ),
              const SizedBox(height: 1),
              Text(
                subtitle,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 9,
                  color: AppColors.mutedText,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class TransportCompactStatChip extends StatelessWidget {
  const TransportCompactStatChip({
    super.key,
    required this.label,
    required this.value,
    this.accentColor = AppColors.primaryPurple,
  });

  final String label;
  final String value;
  final Color accentColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: accentColor.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            '$label: ',
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: AppColors.mutedText,
            ),
          ),
          Flexible(
            child: Text(
              value,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w800,
                color: accentColor,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class TransportSummaryRow extends StatelessWidget {
  const TransportSummaryRow({
    super.key,
    required this.primaryLabel,
    required this.primaryValue,
    required this.secondaryLabel,
    required this.secondaryValue,
  });

  final String primaryLabel;
  final String primaryValue;
  final String secondaryLabel;
  final String secondaryValue;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: TransportMiniStat(label: primaryLabel, value: primaryValue),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: TransportMiniStat(
            label: secondaryLabel,
            value: secondaryValue,
          ),
        ),
      ],
    );
  }
}

class _TransportFieldRow extends StatelessWidget {
  const _TransportFieldRow({
    required this.label,
    required this.controller,
    required this.iconColor,
    required this.icon,
    this.trailing,
  });

  final String label;
  final TextEditingController controller;
  final Color iconColor;
  final IconData icon;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 14),
          child: Icon(icon, size: 14, color: iconColor),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.softBackground,
              borderRadius: BorderRadius.circular(16),
            ),
            child: TextField(
              controller: controller,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: AppColors.deepCharcoal,
              ),
              decoration: InputDecoration(
                labelText: label,
                border: InputBorder.none,
                isDense: true,
                labelStyle: const TextStyle(
                  color: AppColors.mutedText,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ),
        if (trailing != null) ...[const SizedBox(width: 10), trailing!],
      ],
    );
  }
}
