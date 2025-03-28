import React from 'react';
import { Page, Text, View, Document, StyleSheet, Svg, Rect, Path, Font } from '@react-pdf/renderer';
import { InvoicePayload } from '@/types/invoice';
import { formatMoney, displayMoney } from '@/utils/format';
import { TUserInfoReponse } from '@/schema/user';

Font.register({
  family: 'Geist',
  fonts: [
    { src: '/fonts/Geist-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/Geist-SemiBold.ttf', fontWeight: 600 },
    { src: '/fonts/Geist-Bold.ttf', fontWeight: 700 }
  ]
});

// 创建样式
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Geist',
    backgroundColor: '#F8F8F9',
    paddingHorizontal: 16,
    paddingVertical: 24,
    justifyContent: 'center',
    verticalAlign: 'sub'
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: '#18181B',
    lineHeight: '24px',
    verticalAlign: 'sub'
  },
  subtitle: {
    fontSize: 11,
    fontWeight: 400,
    color: '#525252',
    lineHeight: '14px',
    verticalAlign: 'sub'
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexGrow: 1,
    backgroundColor: 'white',
    border: '0.5px solid #E4E4E7',
    borderRadius: 16
  },
  strong: {
    fontWeight: 600,
    color: '#18181B'
  },
  p: {
    fontSize: 10,
    color: '#525252',
    lineHeight: '14px',
    verticalAlign: 'sub'
  },
  table: {
    width: '100%',
    marginBottom: 46,
    borderTop: '0.5px solid #E4E4E7'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5px solid #E4E4E7',
    paddingVertical: 8,
    alignItems: 'center'
  },
  tableCell: {
    flex: 1
  },
  right: {
    textAlign: 'right'
  }
});

// 创建pdf文档
const Pdf = ({ data, user }: { data?: InvoicePayload[]; user?: TUserInfoReponse }) => {
  const item = data?.[0];
  if (!item) return null;
  return (
    <Document>
      <Page size="A4" style={[styles.page]}>
        <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginBottom: 32 }}>
          <View style={{ width: 176, flexDirection: 'column', gap: 12 }}>
            <Text style={styles.title}>Invoice</Text>
            <View style={{ flexDirection: 'row', gap: 20 }}>
              <Text style={styles.subtitle}>Date of Issue</Text>
              <Text style={styles.subtitle}>{new Date().toLocaleDateString()}</Text>
            </View>
          </View>
          <View style={{ borderRadius: 8, width: 40, height: 40, overflow: 'hidden' }}>
            <Svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <Rect width="40" height="40" rx="8" fill="black" />
              <Path
                d="M25.7137 24.0448C24.8513 23.3911 24.1808 22.5065 23.857 21.4742C23.6253 20.7365 23.1786 20.0572 22.5276 19.5397C20.793 18.1607 18.2693 18.4491 16.8903 20.1837C16.5754 20.58 16.3481 21.0169 16.2039 21.4716C15.8757 22.5118 15.2265 23.4176 14.3463 24.0616C13.2062 24.8948 12.4826 26.2649 12.5481 27.7997C12.6427 30.0252 14.4215 31.8473 16.6444 31.9907C17.4007 32.0393 18.119 31.896 18.7558 31.6059C19.574 31.2326 20.5161 31.2335 21.3431 31.5864C21.9269 31.8359 22.5753 31.9623 23.2564 31.9332C25.5607 31.8341 27.4129 29.9332 27.4545 27.6272C27.481 26.165 26.792 24.8621 25.7146 24.0456L25.7137 24.0448Z"
                fill="white"
              />
              <Path
                d="M28.0082 15.4949C28.0957 15.1207 28.033 14.7447 27.8543 14.4334C27.6676 14.1088 27.3572 13.8549 26.9671 13.7487C26.7627 13.693 26.5566 13.6842 26.3603 13.7143C26.5 13.8284 26.6177 13.9672 26.7061 14.122C26.8927 14.4467 26.9547 14.8429 26.8494 15.233L25.7473 19.3542L25.7747 19.3214L25.5111 20.3042H25.5129C25.2581 21.3665 25.8941 22.443 26.9556 22.7278C28.0162 23.0117 29.1059 22.397 29.4164 21.3506H29.4182L29.4323 21.2984L29.7861 19.9786C30.2594 18.2131 29.4872 16.4086 28.0091 15.494L28.0082 15.4949Z"
                fill="white"
              />
              <Path
                d="M14.4861 20.3063H14.4879L14.2243 19.3226L14.2517 19.3554L13.1496 15.2343C13.0434 14.8442 13.1062 14.4479 13.2929 14.1233C13.3813 13.9685 13.499 13.8305 13.6387 13.7155C13.4424 13.6845 13.2363 13.6943 13.0319 13.75C12.6418 13.8561 12.3314 14.1091 12.1447 14.4347C11.9661 14.746 11.9033 15.1219 11.9908 15.4961C10.5127 16.4107 9.74053 18.2152 10.2138 19.9808L10.5676 21.3005L10.5817 21.3536H10.5835C10.894 22.4 11.9837 23.0148 13.0443 22.7308C14.1049 22.4469 14.7409 21.3695 14.487 20.3081L14.4861 20.3063Z"
                fill="white"
              />
              <Path
                d="M14.8983 16.9227H14.9018C15.2096 18.1169 16.4029 18.875 17.6271 18.6282C18.8513 18.3814 19.6572 17.22 19.4785 15.9993H19.482L19.4572 15.8746L19.4546 15.8604L18.2958 10.0985C18.1835 9.55093 18.3047 9.01046 18.5895 8.5788C18.7257 8.3727 18.8991 8.19226 19.1017 8.04719C18.8336 7.98793 18.5488 7.98262 18.2622 8.04188C17.7147 8.15422 17.2653 8.47708 16.9796 8.90874C16.6957 9.33863 16.5754 9.87556 16.6842 10.4196C15.0769 11.4209 14.1774 13.3465 14.5736 15.3129L14.8983 16.9227Z"
                fill="white"
              />
              <Path
                d="M22.4983 18.6287C23.7225 18.8755 24.9158 18.1174 25.2236 16.9224H25.2272L25.5518 15.3125C25.9481 13.3471 25.0485 11.4214 23.4412 10.4192C23.55 9.87521 23.4298 9.3374 23.1467 8.9084C22.8619 8.47674 22.4117 8.15388 21.8641 8.04154C21.5775 7.98316 21.2927 7.98758 21.0247 8.04685C21.2281 8.19191 21.4015 8.37236 21.5368 8.57846C21.8217 9.01012 21.9419 9.55058 21.8305 10.0981L20.67 15.8689V15.8742H20.6691L20.6443 15.9981H20.6479C20.4683 17.2196 21.275 18.381 22.4992 18.6278L22.4983 18.6287Z"
                fill="white"
              />
            </Svg>
          </View>
        </View>
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', gap: 40 }}>
            <View>
              <Text style={[styles.p, styles.strong]}>ClawCloud</Text>
              <Text style={styles.p}>ClawCloud (Singapore) Private Limited</Text>
              <Text style={styles.p}>10 Collyer Quay</Text>
              <Text style={styles.p}># 10-01 Ocean Financial Center</Text>
              <Text style={styles.p}>Singapore 049315</Text>
            </View>
            <View>
              <Text style={[styles.p, styles.strong]}>Bill To</Text>
              <Text style={styles.p}>
                {user?.user?.firstname} {user?.user?.lastname}
              </Text>
              <Text style={styles.p}>{user?.user?.email}</Text>
            </View>
          </View>
          <View style={{ marginTop: 22, marginBottom: 28 }}>
            <Text style={styles.p}>Invoice of (USD)</Text>
            <Text style={[styles.title, { fontSize: 20 }]}>
              ${displayMoney(formatMoney(item?.Amount))}
            </Text>
          </View>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={styles.p}>ITEM DETAIL</Text>
              </View>
              <View style={{ width: 100 }}>
                <Text style={styles.p}>DATE</Text>
              </View>
              <View style={{ width: 100 }}>
                <Text style={styles.p}>PAYMENT METHOD</Text>
              </View>
              <View style={{ width: 90 }}>
                <Text style={styles.p}>ID</Text>
              </View>
              <View style={{ width: 90 }}>
                <Text style={[styles.p, styles.right]}>AMOUNT</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={[styles.p, styles.strong]}>{item?.Type}</Text>
                <Text style={styles.p}>{item?.ChargeSource}</Text>
              </View>
              <View style={{ width: 100 }}>
                <Text style={[styles.p, styles.strong]}>
                  {new Date(item?.CreatedAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={{ width: 100 }}>
                <Text style={[styles.p, styles.strong]}>{item?.Method as string}</Text>
              </View>
              <View style={{ width: 90 }}>
                <Text style={[styles.p, styles.strong]}>{item?.ID}</Text>
              </View>
              <View style={{ width: 90 }}>
                <Text style={[styles.p, styles.strong, styles.right]}>
                  ${displayMoney(formatMoney(item?.Amount))} USD
                </Text>
              </View>
            </View>
          </View>
          <Text style={[styles.p, styles.strong]}>Thanks for the Bussiness.</Text>
        </View>
        <View style={{ marginTop: 37 }}>
          <Text style={[styles.p]}>Terms & Conditions</Text>
        </View>
      </Page>
    </Document>
  );
};

export default Pdf;
