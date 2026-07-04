// ========== Region Data for Cascader ==========
// 4-level cascading: country → province/state → city → district/county
// 中国 34省级 + 4 直辖市 + 主要城市 + 热门区县,热门国家主要城市 + 热门区

export interface RegionOption {
  value: string;
  label: string;
  children?: RegionOption[];
}

// ========== Country Region Tags ==========
// 给每个国家打上 region 标签,用于旅游分类→国家范围的联动
// Region 取值:'domestic' | 'asia' | 'europe' | 'america' | 'oceania' | 'other'
export type CountryRegion = 'domestic' | 'asia' | 'europe' | 'america' | 'oceania' | 'other';

export const COUNTRY_REGIONS: Record<string, CountryRegion> = {
  '中国': 'domestic',
  '日本': 'asia',
  '韩国': 'asia',
  '泰国': 'asia',
  '新加坡': 'asia',
  '马来西亚': 'asia',
  '印度尼西亚': 'asia',
  '印度': 'asia',
  '越南': 'asia',
  '土耳其': 'asia', // 地理上跨欧亚,按"亚洲旅行"用户场景归到 asia
  '美国': 'america',
  '法国': 'europe',
  '英国': 'europe',
  '意大利': 'europe',
  '澳大利亚': 'oceania',
  '其他': 'other',
};

// 根据 region 列表过滤国家
export function getCountriesByRegions(regions: CountryRegion[]): RegionOption[] {
  if (!regions || regions.length === 0) return COUNTRIES;
  return COUNTRIES.filter(c => regions.includes(COUNTRY_REGIONS[c.value] || 'other'));
}

// ========== 旅游分类 → 国家 region 范围映射 ==========
// 旅行日记表单选完"旅游分类"后,Cascader 会自动按此表限定国家范围
// 例如选了"国内旅行" → 只显示中国;选了"亚洲旅行" → 显示日本/韩国/泰国等
export const TRAVEL_CATEGORY_REGIONS: Record<string, CountryRegion[]> = {
  '国内旅行': ['domestic'],
  '亚洲旅行': ['asia', 'domestic'],
  '欧洲旅行': ['europe'],
  '美洲旅行': ['america'],
  '大洋洲旅行': ['oceania'],
  '短途周边': ['domestic', 'asia'],
  '深度旅行': [], // 留空表示不限制
};

export function getRegionsForCategory(category: string): CountryRegion[] | undefined {
  if (!(category in TRAVEL_CATEGORY_REGIONS)) return undefined;
  return TRAVEL_CATEGORY_REGIONS[category];
}

export function getCategoryRangeHint(category: string): string {
  const regions = TRAVEL_CATEGORY_REGIONS[category];
  if (!regions) return '';
  if (regions.length === 0) return '不限制范围(可任选国家)';
  const map: Record<CountryRegion, string> = {
    domestic: '仅中国',
    asia: '亚洲',
    europe: '欧洲',
    america: '美洲',
    oceania: '大洋洲',
    other: '其他',
  };
  const labels = regions.map(r => map[r]);
  if (labels.includes('仅中国') && labels.length === 1) return '仅显示中国';
  return `仅显示 ${labels.join(' / ')} 国家`;
}

// 中国 34 省级行政区
const CHINA_PROVINCES: RegionOption[] = [
  { value: '北京', label: '北京' },
  { value: '天津', label: '天津' },
  { value: '上海', label: '上海' },
  { value: '重庆', label: '重庆' },
  { value: '河北', label: '河北' },
  { value: '山西', label: '山西' },
  { value: '内蒙古', label: '内蒙古' },
  { value: '辽宁', label: '辽宁' },
  { value: '吉林', label: '吉林' },
  { value: '黑龙江', label: '黑龙江' },
  { value: '江苏', label: '江苏' },
  { value: '浙江', label: '浙江' },
  { value: '安徽', label: '安徽' },
  { value: '福建', label: '福建' },
  { value: '江西', label: '江西' },
  { value: '山东', label: '山东' },
  { value: '河南', label: '河南' },
  { value: '湖北', label: '湖北' },
  { value: '湖南', label: '湖南' },
  { value: '广东', label: '广东' },
  { value: '广西', label: '广西' },
  { value: '海南', label: '海南' },
  { value: '四川', label: '四川' },
  { value: '贵州', label: '贵州' },
  { value: '云南', label: '云南' },
  { value: '西藏', label: '西藏' },
  { value: '陕西', label: '陕西' },
  { value: '甘肃', label: '甘肃' },
  { value: '青海', label: '青海' },
  { value: '宁夏', label: '宁夏' },
  { value: '新疆', label: '新疆' },
  { value: '香港', label: '中国香港' },
  { value: '澳门', label: '中国澳门' },
  { value: '台湾', label: '中国台湾' },
];

// 4 个直辖市(无下属城市列表,直接列出为 city 级别)
const MUNICIPALITIES: Record<string, string[]> = {
  '北京': ['北京'],
  '天津': ['天津'],
  '上海': ['上海'],
  '重庆': ['重庆'],
};

// 特别行政区
const SAR: Record<string, string[]> = {
  '香港': ['香港岛', '九龙', '新界'],
  '澳门': ['澳门半岛', '离岛'],
  '台湾': ['台北', '高雄', '台中', '台南', '新北', '基隆', '新竹', '嘉义'],
};

// 各省主要城市(覆盖热门旅游目的地)
const PROVINCE_CITIES: Record<string, string[]> = {
  '河北': ['石家庄', '唐山', '保定', '邯郸', '秦皇岛', '承德', '张家口', '沧州'],
  '山西': ['太原', '大同', '运城', '临汾', '平遥', '五台山', '晋城'],
  '内蒙古': ['呼和浩特', '包头', '鄂尔多斯', '呼伦贝尔', '锡林浩特', '赤峰'],
  '辽宁': ['沈阳', '大连', '鞍山', '抚顺', '本溪', '丹东', '锦州', '营口'],
  '吉林': ['长春', '吉林市', '延吉', '长白山', '通化', '四平'],
  '黑龙江': ['哈尔滨', '齐齐哈尔', '牡丹江', '大庆', '佳木斯', '漠河'],
  '江苏': ['南京', '苏州', '无锡', '常州', '扬州', '镇江', '南通', '徐州', '连云港', '常州'],
  '浙江': ['杭州', '宁波', '温州', '绍兴', '嘉兴', '湖州', '金华', '舟山', '台州', '丽水', '乌镇', '西塘'],
  '安徽': ['合肥', '黄山', '芜湖', '蚌埠', '安庆', '宏村', '九华山'],
  '福建': ['福州', '厦门', '泉州', '漳州', '武夷山', '三明', '宁德'],
  '江西': ['南昌', '九江', '景德镇', '赣州', '上饶', '庐山', '井冈山'],
  '山东': ['济南', '青岛', '烟台', '威海', '潍坊', '淄博', '泰安', '曲阜', '日照', '临沂'],
  '河南': ['郑州', '洛阳', '开封', '安阳', '新乡', '焦作', '南阳', '信阳', '少林寺'],
  '湖北': ['武汉', '宜昌', '襄阳', '十堰', '黄冈', '恩施', '荆州', '神农架'],
  '湖南': ['长沙', '张家界', '凤凰', '岳阳', '衡阳', '湘潭', '郴州', '怀化'],
  '广东': ['广州', '深圳', '珠海', '汕头', '佛山', '东莞', '中山', '惠州', '湛江', '肇庆', '潮州', '清远'],
  '广西': ['南宁', '桂林', '北海', '柳州', '阳朔', '梧州', '钦州', '防城港'],
  '海南': ['海口', '三亚', '儋州', '琼海', '万宁', '文昌', '五指山'],
  '四川': ['成都', '绵阳', '乐山', '峨眉山', '宜宾', '泸州', '达州', '九寨沟', '稻城', '康定'],
  '贵州': ['贵阳', '遵义', '安顺', '黄果树', '荔波', '西江千户苗寨', '镇远'],
  '云南': ['昆明', '丽江', '大理', '西双版纳', '香格里拉', '腾冲', '瑞丽', '玉龙雪山', '泸沽湖'],
  '西藏': ['拉萨', '日喀则', '林芝', '昌都', '山南', '纳木错', '布达拉宫'],
  '陕西': ['西安', '咸阳', '宝鸡', '延安', '汉中', '榆林', '华山', '秦始皇陵'],
  '甘肃': ['兰州', '敦煌', '嘉峪关', '张掖', '酒泉', '天水', '武威'],
  '青海': ['西宁', '格尔木', '德令哈', '青海湖', '茶卡盐湖', '玉树'],
  '宁夏': ['银川', '石嘴山', '吴忠', '固原', '中卫', '沙坡头'],
  '新疆': ['乌鲁木齐', '喀什', '吐鲁番', '哈密', '伊宁', '克拉玛依', '塔城', '喀纳斯', '那拉提'],
};

// ========== 中国城市 → 区/县 数据 ==========
// 覆盖 4 直辖市 + 主要旅游城市 + 省会城市
// key 格式: "省/直辖市>城市"  e.g. "上海>上海", "北京>北京", "浙江>杭州"
const CITY_DISTRICTS: Record<string, string[]> = {
  // 4 个直辖市(在数据中"省名"和"城市名"相同)
  '北京>北京': ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '石景山区', '通州区', '昌平区', '大兴区', '顺义区', '房山区', '门头沟区'],
  '天津>天津': ['和平区', '河东区', '河西区', '南开区', '河北区', '红桥区', '滨海新区', '西青区', '津南区', '东丽区'],
  '上海>上海': ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '浦东新区', '闵行区', '宝山区', '嘉定区', '金山区'],
  '重庆>重庆': ['渝中区', '江北区', '南岸区', '沙坪坝区', '九龙坡区', '渝北区', '巴南区', '大渡口区', '北碚区', '万州区', '涪陵区'],

  // 省会及主要城市
  '江苏>南京': ['玄武区', '秦淮区', '建邺区', '鼓楼区', '栖霞区', '雨花台区', '江宁区', '六合区', '浦口区'],
  '江苏>苏州': ['姑苏区', '工业园区', '高新区', '吴中区', '相城区', '吴江区', '虎丘区'],
  '浙江>杭州': ['上城区', '拱墅区', '西湖区', '滨江区', '萧山区', '余杭区', '临平区', '钱塘区', '富阳区', '临安区'],
  '广东>广州': ['越秀区', '荔湾区', '海珠区', '天河区', '白云区', '黄埔区', '番禺区', '花都区', '南沙区', '从化区'],
  '广东>深圳': ['福田区', '罗湖区', '南山区', '宝安区', '龙岗区', '龙华区', '坪山区', '光明区', '盐田区'],
  '四川>成都': ['锦江区', '青羊区', '金牛区', '武侯区', '成华区', '高新区', '双流区', '龙泉驿区', '温江区', '新都区'],
  '湖北>武汉': ['江岸区', '江汉区', '硚口区', '汉阳区', '武昌区', '青山区', '洪山区', '东西湖区', '蔡甸区', '黄陂区', '江夏区'],
  '陕西>西安': ['新城区', '碑林区', '莲湖区', '灞桥区', '未央区', '雁塔区', '阎良区', '临潼区', '长安区', '高陵区', '鄠邑区'],
  '福建>厦门': ['思明区', '湖里区', '集美区', '海沧区', '同安区', '翔安区'],
  '山东>青岛': ['市南区', '市北区', '李沧区', '崂山区', '黄岛区', '城阳区', '即墨区', '胶州市'],
  '山东>济南': ['历下区', '市中区', '槐荫区', '天桥区', '历城区', '长清区', '章丘区', '高新区'],
  '湖南>长沙': ['芙蓉区', '天心区', '岳麓区', '开福区', '雨花区', '望城区', '长沙县', '宁乡市'],
  '河南>郑州': ['中原区', '二七区', '管城区', '金水区', '上街区', '惠济区', '郑东新区', '高新区', '经开区'],
  '云南>昆明': ['五华区', '盘龙区', '官渡区', '西山区', '东川区', '呈贡区', '晋宁区', '安宁市'],
  '云南>大理': ['大理市', '古城区', '洱源县', '剑川县', '鹤庆县', '祥云县', '宾川县'],
  '云南>丽江': ['古城区', '永胜县', '华坪县', '玉龙纳西族自治县', '宁蒗彝族自治县'],
  '辽宁>大连': ['中山区', '西岗区', '沙河口区', '甘井子区', '旅顺口区', '金州区', '开发区'],
  '广西>桂林': ['秀峰区', '叠彩区', '象山区', '七星区', '雁山区', '临桂区', '阳朔县', '灵川县'],
  '海南>三亚': ['吉阳区', '天涯区', '海棠区', '崖州区'],
  '贵州>贵阳': ['云岩区', '南明区', '花溪区', '乌当区', '白云区', '观山湖区', '清镇市'],
  '甘肃>兰州': ['城关区', '七里河区', '西固区', '安宁区', '红古区', '永登县', '榆中县', '皋兰县'],
  '新疆>乌鲁木齐': ['天山区', '沙依巴克区', '新市区', '水磨沟区', '头屯河区', '达坂城区', '米东区'],

  // 热门旅游城市
  '广西>阳朔': ['阳朔镇', '兴坪镇', '福利镇', '高田镇', '白沙镇'],
  '云南>香格里拉': ['建塘镇', '虎跳峡镇', '小中甸镇'],
  '西藏>拉萨': ['城关区', '堆龙德庆区', '达孜区', '林周县', '当雄县', '曲水县'],
  '江西>庐山': ['牯岭镇', '威家镇', '蛟塘镇', '海会镇'],
  '江西>景德镇': ['昌江区', '珠山区', '浮梁县', '乐平市'],
  '安徽>黄山': ['屯溪区', '黄山区', '徽州区', '歙县', '休宁县', '黟县', '祁门县'],
  '福建>武夷山': ['武夷街道', '度假区', '三姑度假区'],
  '内蒙古>呼伦贝尔': ['海拉尔区', '满洲里市', '扎赉诺尔区', '牙克石市', '额尔古纳市'],
  '黑龙江>漠河': ['西林吉镇', '图强镇', '阿木尔镇', '兴安镇'],
};

// ========== 外国城市 → 区/县 数据 ==========
// key 格式: "国家>城市"  e.g. "日本>东京"
const FOREIGN_CITY_DISTRICTS: Record<string, string[]> = {
  // 日本
  '日本>东京': ['新宿区', '涩谷区', '港区', '中央区', '千代田区', '文京区', '台东区', '墨田区', '江東区', '品川区', '目黒区', '世田谷区', '中野区', '杉並区', '豊島区', '北区', '荒川区', '板橋区', '練馬区', '足立区', '葛飾区', '江戸川区'],
  '日本>大阪': ['北区', '中央区', '西区', '浪速区', '天王寺区', '阿倍野区', '淀川区', '住吉区', '東住吉区', '平野区'],
  '日本>京都': ['上京区', '中京区', '下京区', '東山区', '山科区', '左京区', '右京区', '北区', '南区', '伏見区'],
  '日本>北海道>札幌': ['中央区', '北区', '東区', '白石区', '厚別区', '豊平区', '清田区', '南区', '西区', '手稲区'],

  // 韩国
  '韩国>首尔': ['江南区', '江北区', '江西区', '冠岳区', '广津区', '九老区', '瑞草区', '城东区', '城北区', '松坡区', '阳川区', '龙山区', '麻浦区', '西大门区', '恩平区', '钟路区', '中浪区', '永登浦区', '东大门区'],
  '韩国>釜山': ['海雲台区', '南区', '东区', '西区', '北区', '中区', '沙下区', '金井区', '江西区', '莲堤区', '水营区', '沙上区', '机张郡'],

  // 泰国
  '泰国>曼谷': ['暹罗', '素坤逸', '是隆/沙吞', '考山路', '大皇宫周边', '唐人街', '河滨', '阿索', '通罗'],
  '泰国>清迈': ['古城内', '塔佩门', '宁曼路', '清迈大学', '滨河', '长康路夜市'],

  // 美国
  '美国>加利福尼亚>洛杉矶': ['好莱坞', '比佛利山庄', '圣莫尼卡', '威尼斯海滩', '市中心', '小东京', '韩国城', '帕萨迪纳'],
  '美国>加利福尼亚>旧金山': ['渔人码头', '联合广场', '金融区', '卡斯楚区', '唐人街', '诺布山', '海特-亚什伯里', '米慎区'],
  '美国>纽约>纽约市': ['曼哈顿', '布鲁克林', '皇后区', '布朗克斯', '史泰登岛', '长岛市', '威廉斯堡', '上东区', '下城区', '中城区', '哈林区', 'SOHO', '雀儿喜'],
  '美国>内华达>拉斯维加斯': ['拉斯维加斯大道', '老城区(Fremont)', '市中心', '西湖区'],

  // 法国
  '法国>巴黎大区>巴黎': ['第1区(卢浮宫)', '第4区(巴黎圣母院)', '第5区(拉丁区)', '第6区(卢森堡)', '第7区(铁塔)', '第8区(香榭丽舍)', '第9区(歌剧院)', '第10区', '第11区', '第14区', '第15区', '第16区', '第17区', '18区(蒙马特)', '玛黑区', '拉丁区'],

  // 英国
  '英国>英格兰>伦敦': ['威斯敏斯特', '肯辛顿与切尔西', '卡姆登', '格林尼治', '哈克尼', '伊斯灵顿', '兰贝斯', '南华克', '陶尔哈姆莱茨', '旺兹沃思', '汉默史密斯-富勒姆', '金融城'],

  // 意大利
  '意大利>罗马>罗马市区': ['梵蒂冈周边', '西班牙广场', '特雷维喷泉', '万神殿', '纳沃纳广场', '斗兽场', '波各赛', '特拉斯提弗列', '蒙蒂', '泰斯塔乔'],
  '意大利>米兰>米兰市区': ['市中心', '布宜诺斯艾利斯', '纳维利', '布雷拉', '加里波第', '伊索拉', '运河区', '蒙特拿破仑'],

  // 新加坡
  '新加坡>新加坡': ['滨海湾', '牛车水', '小印度', '圣淘沙', '乌节路', '克拉码头', '甘榜格南', '武吉知马', '宏茂桥', '碧山', '荷兰村', '东海岸'],

  // 澳大利亚
  '澳大利亚>新南威尔士>悉尼': ['悉尼CBD', '邦迪', '曼利', '帕丁顿', '萨利山', '新镇', '帕拉马塔', '达令港', '环形码头', '岩石区'],
  '澳大利亚>维多利亚>墨尔本': ['CBD', '南岸', '圣基尔达', '卡尔顿', '菲茨罗伊', '南雅拉', '里士满', '帕克维尔', '布伦瑞克', '柯林斯街'],

  // 香港
  '中国香港>香港岛': ['中西区', '湾仔区', '东区', '南区'],
  '中国香港>九龙': ['油尖旺区', '深水埗区', '九龙城区', '黄大仙区', '观塘区'],
  '中国香港>新界': ['荃湾区', '屯门区', '元朗区', '北区', '大埔区', '沙田区', '葵青区', '离岛区'],
};

// 日本
const JAPAN_PREFECTURES: RegionOption[] = [
  { value: '东京', label: '东京' },
  { value: '大阪', label: '大阪' },
  { value: '京都', label: '京都' },
  { value: '北海道', label: '北海道' },
  { value: '福冈', label: '福冈' },
  { value: '冲绳', label: '冲绳' },
  { value: '奈良', label: '奈良' },
  { value: '横滨', label: '横滨' },
  { value: '名古屋', label: '名古屋' },
  { value: '神户', label: '神户' },
  { value: '广岛', label: '广岛' },
  { value: '仙台', label: '仙台' },
];

const JAPAN_CITIES: Record<string, string[]> = {
  '东京': ['新宿', '涩谷', '池袋', '银座', '浅草', '秋叶原', '上野', '六本木', '表参道'],
  '大阪': ['难波', '心斋桥', '梅田', '天王寺', '新世界', '道顿堀'],
  '京都': ['清水寺', '岚山', '祇园', '伏见稻荷', '金阁寺', '银阁寺', '二条城'],
  '北海道': ['札幌', '小樽', '函馆', '旭川', '富良野', '登别', '洞爷湖'],
  '福冈': ['博多', '天神', '中洲', '太宰府'],
  '冲绳': ['那霸', '冲绳本岛', '宫古岛', '石垣岛'],
  '奈良': ['奈良公园', '东大寺', '兴福寺'],
  '横滨': ['中华街', '港未来', '八景岛'],
  '名古屋': ['荣', '名古屋站', '热田神宫'],
  '神户': ['神户港', '北野异人馆', '有马温泉'],
  '广岛': ['广岛市', '宫岛', '严岛神社'],
  '仙台': ['仙台市', '松岛'],
};

// 韩国
const KOREA_REGIONS: RegionOption[] = [
  { value: '首尔', label: '首尔' },
  { value: '釜山', label: '釜山' },
  { value: '济州岛', label: '济州岛' },
  { value: '仁川', label: '仁川' },
  { value: '大邱', label: '大邱' },
  { value: '庆州', label: '庆州' },
];

const KOREA_CITIES: Record<string, string[]> = {
  '首尔': ['明洞', '弘大', '江南', '首尔站', '东大门', '景福宫', '南山塔', '北村韩屋'],
  '釜山': ['海云台', '南浦洞', '札嘎其', '甘川文化村', '太宗台'],
  '济州岛': ['济州市', '西归浦', '城山日出峰', '汉拿山'],
  '仁川': ['仁川机场', '中国城'],
  '大邱': ['东城路', '八公山'],
  '庆州': ['佛国寺', '石窟庵', '庆州古城'],
};

// 泰国
const THAILAND_REGIONS: RegionOption[] = [
  { value: '曼谷', label: '曼谷' },
  { value: '清迈', label: '清迈' },
  { value: '普吉岛', label: '普吉岛' },
  { value: '苏梅岛', label: '苏梅岛' },
  { value: '芭提雅', label: '芭提雅' },
  { value: '华欣', label: '华欣' },
  { value: '甲米', label: '甲米' },
];

const THAILAND_CITIES: Record<string, string[]> = {
  '曼谷': ['考山路', '暹罗广场', '大皇宫', '卧佛寺', '唐人街', '河滨夜市'],
  '清迈': ['古城', '宁曼路', '清迈大学', '双龙寺', '拜县'],
  '普吉岛': ['巴东海滩', '卡塔海滩', '皮皮岛', '斯米兰群岛'],
  '苏梅岛': ['查汶海滩', '拉迈海滩', '帕岸岛'],
  '芭提雅': ['芭提雅海滩', '格兰岛', '步行街'],
  '华欣': ['华欣海滩', '拷汪宫'],
  '甲米': ['甲米镇', '莱利半岛', '甲米奥南'],
};

// 美国
const USA_STATES: RegionOption[] = [
  { value: '加利福尼亚', label: '加利福尼亚' },
  { value: '纽约', label: '纽约' },
  { value: '内华达', label: '内华达(拉斯维加斯)' },
  { value: '夏威夷', label: '夏威夷' },
  { value: '佛罗里达', label: '佛罗里达' },
  { value: '德克萨斯', label: '德克萨斯' },
  { value: '华盛顿', label: '华盛顿' },
];

const USA_CITIES: Record<string, string[]> = {
  '加利福尼亚': ['洛杉矶', '旧金山', '圣地亚哥', '圣何塞', '伯克利', '优胜美地'],
  '纽约': ['纽约市', '曼哈顿', '布鲁克林', '皇后区', '水牛城'],
  '内华达': ['拉斯维加斯', '雷诺'],
  '夏威夷': ['火奴鲁鲁(檀香山)', '毛伊岛', '大岛'],
  '佛罗里达': ['迈阿密', '奥兰多', '坦帕', '杰克逊维尔'],
  '德克萨斯': ['休斯顿', '达拉斯', '奥斯汀', '圣安东尼奥'],
  '华盛顿': ['西雅图', '塔科马'],
};

// 法国
const FRANCE_REGIONS: RegionOption[] = [
  { value: '巴黎大区', label: '巴黎大区' },
  { value: '普罗旺斯', label: '普罗旺斯' },
  { value: '蔚蓝海岸', label: '蔚蓝海岸' },
  { value: '卢瓦尔河谷', label: '卢瓦尔河谷' },
  { value: '诺曼底', label: '诺曼底' },
];

const FRANCE_CITIES: Record<string, string[]> = {
  '巴黎大区': ['巴黎', '凡尔赛', '枫丹白露', '迪士尼'],
  '普罗旺斯': ['马赛', '阿维尼翁', '艾克斯', '戛纳', '阿尔勒', '戈尔德'],
  '蔚蓝海岸': ['尼斯', '摩纳哥', '昂蒂布', '戛纳'],
  '卢瓦尔河谷': ['图尔', '奥尔良', '昂布瓦兹'],
  '诺曼底': ['鲁昂', '勒阿弗尔', '圣米歇尔山'],
};

// 英国
const UK_REGIONS: RegionOption[] = [
  { value: '英格兰', label: '英格兰' },
  { value: '苏格兰', label: '苏格兰' },
  { value: '威尔士', label: '威尔士' },
  { value: '北爱尔兰', label: '北爱尔兰' },
];

const UK_CITIES: Record<string, string[]> = {
  '英格兰': ['伦敦', '曼彻斯特', '利物浦', '牛津', '剑桥', '巴斯', '约克', '布里斯托', '温莎'],
  '苏格兰': ['爱丁堡', '格拉斯哥', '高地', '尼斯湖', '圣安德鲁斯'],
  '威尔士': ['加的夫', '斯诺登尼亚'],
  '北爱尔兰': ['贝尔法斯特', '巨人之路'],
};

// 意大利
const ITALY_REGIONS: RegionOption[] = [
  { value: '罗马', label: '罗马' },
  { value: '米兰', label: '米兰' },
  { value: '威尼斯', label: '威尼斯' },
  { value: '佛罗伦萨', label: '佛罗伦萨' },
  { value: '那不勒斯', label: '那不勒斯' },
  { value: '托斯卡纳', label: '托斯卡纳' },
];

const ITALY_CITIES: Record<string, string[]> = {
  '罗马': ['罗马市区', '梵蒂冈', '蒂沃利'],
  '米兰': ['米兰市区', '科莫湖', '维罗纳'],
  '威尼斯': ['威尼斯主岛', '穆拉诺', '彩色岛'],
  '佛罗伦萨': ['佛罗伦萨市区', '比萨', '锡耶纳', '圣吉米尼亚诺'],
  '那不勒斯': ['那不勒斯', '庞贝', '阿马尔菲', '卡普里岛'],
  '托斯卡纳': ['佛罗伦萨', '锡耶纳', '比萨', '卢卡', '蒙特普齐亚诺'],
};

// 澳大利亚
const AUSTRALIA_STATES: RegionOption[] = [
  { value: '新南威尔士', label: '新南威尔士' },
  { value: '维多利亚', label: '维多利亚' },
  { value: '昆士兰', label: '昆士兰' },
  { value: '西澳大利亚', label: '西澳大利亚' },
  { value: '南澳大利亚', label: '南澳大利亚' },
  { value: '塔斯马尼亚', label: '塔斯马尼亚' },
];

const AUSTRALIA_CITIES: Record<string, string[]> = {
  '新南威尔士': ['悉尼', '蓝山', '纽卡斯尔', '猎人谷'],
  '维多利亚': ['墨尔本', '大洋路', '菲利普岛'],
  '昆士兰': ['布里斯班', '黄金海岸', '凯恩斯', '大堡礁', '圣灵群岛'],
  '西澳大利亚': ['珀斯', '罗特尼斯岛', '玛格丽特河'],
  '南澳大利亚': ['阿德莱德', '袋鼠岛', '巴罗萨谷'],
  '塔斯马尼亚': ['霍巴特', '摇篮山', '酒杯湾'],
};

// 新加坡(国家)
const SINGAPORE_REGIONS: RegionOption[] = [
  { value: '新加坡', label: '新加坡' },
];
const SINGAPORE_CITIES: Record<string, string[]> = {
  '新加坡': ['滨海湾', '牛车水', '小印度', '圣淘沙', '乌节路', '克拉码头', '甘榜格南'],
};

// 马来西亚
const MALAYSIA_STATES: RegionOption[] = [
  { value: '吉隆坡', label: '吉隆坡' },
  { value: '槟城', label: '槟城' },
  { value: '马六甲', label: '马六甲' },
  { value: '沙巴', label: '沙巴' },
  { value: '兰卡威', label: '兰卡威' },
];

const MALAYSIA_CITIES: Record<string, string[]> = {
  '吉隆坡': ['双子塔', '武吉免登', '茨厂街', '独立广场'],
  '槟城': ['乔治市', '升旗山', '极乐寺'],
  '马六甲': ['马六甲古城', '鸡场街'],
  '沙巴': ['亚庇', '东姑阿都拉曼海洋公园', '神山'],
  '兰卡威': ['兰卡威主岛', '天空之桥', '珍南海滩'],
};

// 印度尼西亚(主要:巴厘岛)
const INDONESIA_REGIONS: RegionOption[] = [
  { value: '巴厘岛', label: '巴厘岛' },
  { value: '雅加达', label: '雅加达' },
  { value: '日惹', label: '日惹' },
];

const INDONESIA_CITIES: Record<string, string[]> = {
  '巴厘岛': ['库塔', '乌布', '金巴兰', '努沙杜瓦', '海神庙', '蓝梦岛', '佩尼达岛'],
  '雅加达': ['雅加达市区', '千岛群岛'],
  '日惹': ['日惹市区', '婆罗浮屠', '普兰巴南'],
};

// 印度
const INDIA_REGIONS: RegionOption[] = [
  { value: '德里', label: '德里' },
  { value: '拉贾斯坦邦', label: '拉贾斯坦邦' },
  { value: '喀拉拉邦', label: '喀拉拉邦' },
  { value: '北阿坎德', label: '北阿坎德(恒河源)' },
  { value: '果阿', label: '果阿' },
];

const INDIA_CITIES: Record<string, string[]> = {
  '德里': ['新德里', '老德里', '莲花庙', '红堡'],
  '拉贾斯坦邦': ['斋浦尔', '乌代布尔', '焦特布尔', '杰伊瑟尔梅尔'],
  '喀拉拉邦': ['科钦', '阿勒皮', '慕纳尔'],
  '北阿坎德': ['瑞诗凯诗', '赫里德瓦尔'],
  '果阿': ['北果阿', '南果阿', '帕纳吉'],
};

// 越南
const VIETNAM_REGIONS: RegionOption[] = [
  { value: '河内', label: '河内' },
  { value: '胡志明市', label: '胡志明市' },
  { value: '岘港', label: '岘港' },
  { value: '会安', label: '会安' },
  { value: '下龙湾', label: '下龙湾' },
  { value: '富国岛', label: '富国岛' },
];

const VIETNAM_CITIES: Record<string, string[]> = {
  '河内': ['还剑湖', '老城区', '下龙湾', '宁平'],
  '胡志明市': ['范五老街', '红教堂', '西贡邮局', '古芝地道'],
  '岘港': ['美溪海滩', '巴拿山', '会安'],
  '会安': ['会安古城', '灯笼街'],
  '下龙湾': ['下龙湾游船', '吉婆岛'],
  '富国岛': ['富国岛主岛', '长滩'],
};

// 土耳其
const TURKEY_REGIONS: RegionOption[] = [
  { value: '伊斯坦布尔', label: '伊斯坦布尔' },
  { value: '卡帕多奇亚', label: '卡帕多奇亚' },
  { value: '安塔利亚', label: '安塔利亚' },
  { value: '伊兹密尔', label: '伊兹密尔' },
  { value: '棉花堡', label: '棉花堡' },
];

const TURKEY_CITIES: Record<string, string[]> = {
  '伊斯坦布尔': ['苏丹艾哈迈德', '博斯普鲁斯海峡', '大巴扎', '加拉塔'],
  '卡帕多奇亚': ['格雷梅', '热气球', '精灵烟囱'],
  '安塔利亚': ['安塔利亚老城', '阿斯潘多斯', '西戴'],
  '伊兹密尔': ['以弗所', '阿拉恰特'],
  '棉花堡': ['棉花堡', '希拉波利斯'],
};

// ========== Build China Tree ==========
function buildChinaTree(): RegionOption[] {
  return CHINA_PROVINCES.map(prov => {
    let cities: string[];
    if (MUNICIPALITIES[prov.value]) {
      cities = MUNICIPALITIES[prov.value];
    } else if (SAR[prov.value]) {
      cities = SAR[prov.value];
    } else {
      cities = PROVINCE_CITIES[prov.value] || [prov.value + '市区'];
    }
    return {
      value: prov.value,
      label: prov.label,
      children: cities.map(c => {
        // 中国大陆用 prov.value>c 作为 key
        const key = `${prov.value}>${c}`;
        const districts = CITY_DISTRICTS[key];
        return {
          value: c,
          label: c,
          children: districts && districts.length > 0
            ? districts.map(d => ({ value: d, label: d }))
            : [{ value: '__none__', label: '该城市暂无区/县数据(可跳过)' }],
        };
      }),
    };
  });
}

// ========== Build Country List ==========
// 辅助:给国家树中 city 节点添加 district 第四级
function withDistricts<T extends RegionOption>(nodes: T[], keyPrefix: string): T[] {
  return nodes.map(node => {
    if (!node.children) return node;
    const cityChildren = node.children.map(city => {
      const key = `${keyPrefix}>${city.value}`;
      const districts = FOREIGN_CITY_DISTRICTS[key];
      return {
        ...city,
        children: districts && districts.length > 0
          ? districts.map(d => ({ value: d, label: d }))
          : [{ value: '__none__', label: '该城市暂无区/县数据(可跳过)' }],
      };
    });
    return { ...node, children: cityChildren };
  });
}

const ALL_COUNTRIES: RegionOption[] = [
  { value: '中国', label: '中国', children: buildChinaTree() },
  { value: '日本', label: '日本', children: withDistricts(JAPAN_PREFECTURES.map(p => ({
    value: p.value, label: p.label,
    children: (JAPAN_CITIES[p.value] || []).map(c => ({ value: c, label: c })),
  })), '日本') },
  { value: '韩国', label: '韩国', children: withDistricts(KOREA_REGIONS.map(p => ({
    value: p.value, label: p.label,
    children: (KOREA_CITIES[p.value] || []).map(c => ({ value: c, label: c })),
  })), '韩国') },
  { value: '泰国', label: '泰国', children: withDistricts(THAILAND_REGIONS.map(p => ({
    value: p.value, label: p.label,
    children: (THAILAND_CITIES[p.value] || []).map(c => ({ value: c, label: c })),
  })), '泰国') },
  { value: '美国', label: '美国', children: withDistricts(USA_STATES.map(p => ({
    value: p.value, label: p.label,
    children: (USA_CITIES[p.value] || []).map(c => ({ value: c, label: c })),
  })), '美国') },
  { value: '法国', label: '法国', children: withDistricts(FRANCE_REGIONS.map(p => ({
    value: p.value, label: p.label,
    children: (FRANCE_CITIES[p.value] || []).map(c => ({ value: c, label: c })),
  })), '法国') },
  { value: '英国', label: '英国', children: withDistricts(UK_REGIONS.map(p => ({
    value: p.value, label: p.label,
    children: (UK_CITIES[p.value] || []).map(c => ({ value: c, label: c })),
  })), '英国') },
  { value: '意大利', label: '意大利', children: withDistricts(ITALY_REGIONS.map(p => ({
    value: p.value, label: p.label,
    children: (ITALY_CITIES[p.value] || []).map(c => ({ value: c, label: c })),
  })), '意大利') },
  { value: '澳大利亚', label: '澳大利亚', children: withDistricts(AUSTRALIA_STATES.map(p => ({
    value: p.value, label: p.label,
    children: (AUSTRALIA_CITIES[p.value] || []).map(c => ({ value: c, label: c })),
  })), '澳大利亚') },
  { value: '新加坡', label: '新加坡', children: withDistricts(SINGAPORE_REGIONS.map(p => ({
    value: p.value, label: p.label,
    children: (SINGAPORE_CITIES[p.value] || []).map(c => ({ value: c, label: c })),
  })), '新加坡') },
  { value: '马来西亚', label: '马来西亚', children: withDistricts(MALAYSIA_STATES.map(p => ({
    value: p.value, label: p.label,
    children: (MALAYSIA_CITIES[p.value] || []).map(c => ({ value: c, label: c })),
  })), '马来西亚') },
  { value: '印度尼西亚', label: '印度尼西亚', children: withDistricts(INDONESIA_REGIONS.map(p => ({
    value: p.value, label: p.label,
    children: (INDONESIA_CITIES[p.value] || []).map(c => ({ value: c, label: c })),
  })), '印度尼西亚') },
  { value: '印度', label: '印度', children: withDistricts(INDIA_REGIONS.map(p => ({
    value: p.value, label: p.label,
    children: (INDIA_CITIES[p.value] || []).map(c => ({ value: c, label: c })),
  })), '印度') },
  { value: '越南', label: '越南', children: withDistricts(VIETNAM_REGIONS.map(p => ({
    value: p.value, label: p.label,
    children: (VIETNAM_CITIES[p.value] || []).map(c => ({ value: c, label: c })),
  })), '越南') },
  { value: '土耳其', label: '土耳其', children: withDistricts(TURKEY_REGIONS.map(p => ({
    value: p.value, label: p.label,
    children: (TURKEY_CITIES[p.value] || []).map(c => ({ value: c, label: c })),
  })), '土耳其') },
  { value: '其他', label: '其他(自定义)', children: [{ value: '自定义', label: '手动输入', children: [{ value: '自定义城市', label: '城市', children: [{ value: '自定义区/县', label: '区/县(可选)' }] }] }] },
];

// ========== Public API ==========

export const COUNTRIES: RegionOption[] = ALL_COUNTRIES;

export function getProvinces(country: string): RegionOption[] {
  const c = ALL_COUNTRIES.find(x => x.value === country);
  return c?.children || [];
}

export function getCities(country: string, province: string): RegionOption[] {
  const c = ALL_COUNTRIES.find(x => x.value === country);
  const p = c?.children?.find(x => x.value === province);
  return p?.children || [];
}

export function getDistricts(country: string, province: string, city: string): RegionOption[] {
  const c = ALL_COUNTRIES.find(x => x.value === country);
  const p = c?.children?.find(x => x.value === province);
  const ct = p?.children?.find(x => x.value === city);
  return ct?.children || [];
}

// 旅行分类(旅游树)
export const DEFAULT_TRAVEL_CATEGORIES = [
  '国内旅行',
  '亚洲旅行',
  '欧洲旅行',
  '美洲旅行',
  '大洋洲旅行',
  '短途周边',
  '深度旅行',
];
